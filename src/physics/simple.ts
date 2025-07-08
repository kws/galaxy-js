/*
 * Adapted from galaxy.c, the Galaxy Collision Screen Saver, originally written by Uli Siegmund
 * <uli@wombat.okapi.sub.org> on Amiga for EGS in Cluster.
 *
 * Port from Cluster/EGS to C/Intuition by Harald Backert.
 *
 * Port to X11 & incorporation into xlockmore by Hubert Feyrer <hubert.feyrer@rz.uni-regensburg.de>.
 *
 * Permission to use, copy, modify, and distribute this software and its documentation for any
 * purpose and without fee is hereby granted, provided that the above copyright notice appear in
 * all copies and that both that copyright notice and this permission notice appear in supporting
 * documentation.
 *
 * This file is provided AS IS with no warranties of any kind.  The author shall have no liability
 * with respect to the infringement of copyrights, trade secrets or any patents by this file or any
 * part thereof.  In no event will the author be liable for any lost revenue or profits or other
 * special, indirect and consequential damages.
 *
 * Revision History:
 *
 * 2016-08-14: Ported to ES2015 JavaScript by Ray Toal <rtoal@lmu.edu>
 * 2011-03-12: Ported to JavaScript by Ray Toal <rtoal@lmu.edu>
 * 2001-11-08: Converted to Java applet by Chris Stevenson <chris.stevenson@adelaide.on.net>
 *             http://www.users.on.net/zhcchz/java/galaxy/UniverseApplet.html with z axis
 *             information for star size, perspective view by Richard Loftin <rich@sevenravens.com>
 * 2000-11-14: Port to Win32 by Richard Loftin <rich@sevenravens.com>, now uses z axis information
 *             for star size, perspective view.
 * 1997-05-10: Compatible with xscreensaver
 * 1997-04-18: Memory leak fixed by Tom Schmidt <tschmidt@micron.com>
 * 1997-04-07: Modified by Dave Mitchell <davem@magnet.com>: random star sizes, colors change
 *             depending on velocity
 * 1994-10-23: Modified by David Bagley <bagleyd@tux.org>
 * 1994-10-10: Add colors by Hubert Feyer
 * 1994-09-30: Initial port by Hubert Feyer
 * 1994-03-09: VMS can generate a random number 0.0 which results in a division by zero,
 *             corrected by Jouk Jansen <joukj@hrem.stm.tudelft.nl>
 *
 * This version is a complete rewrite to focus more on physics than performance, but it follows the
 * same basic algorithm as the original.
 */
import { Galaxy, Star } from '../astro';
import { allStars } from './util';
import { Matrix3x3, Vec3 } from '../math';

/**
 * The time step for each update cycle of the simulation. Represents Δt.
 * A smaller value increases simulation accuracy but requires more computations.
 */
const TIME_STEP = 0.005;

/**
 * The gravitational constant for the simulation. This value can be tuned
 * to adjust the strength of the gravitational pull between celestial bodies.
 */
const G = 0.001;

/**
 * Updates the velocities and positions of the stars and galaxies
 * using Symplectic Euler integration.
 * @param galaxies - The array of galaxies to update.
 */
export const updateGalaxies = (galaxies: Galaxy[]) => {
  // 1. Update star velocities and positions
  allStars(galaxies, (star) => {
    // Accumulates the total acceleration on the star from all galaxies
    let totalAcceleration = Vec3.zero();

    for (const otherGalaxy of galaxies) {
      // Get the vector from the star to the center of the other galaxy
      const dPos = otherGalaxy.pos.sub(star.pos);
      const distSq = dPos.magnitude ** 2; // Use squared distance for efficiency

      // Avoid division by zero if a star is exactly at a galaxy's center
      if (distSq === 0) continue;

      // The formula for the gravitational acceleration vector is a = (G * M / r³) * r_vec
      // where M is the mass of the attracting body and r is the distance.
      const dist = Math.sqrt(distSq);
      const accelerationScalar = (G * otherGalaxy.mass) / (dist * distSq); // (G * M / r³)
      const accelerationVec = dPos.mul(accelerationScalar);

      // Add this galaxy's contribution to the total acceleration
      totalAcceleration = totalAcceleration.add(accelerationVec);
    }

    // Update velocity using acceleration: Δv = a * Δt
    const deltaVelocity = totalAcceleration.mul(TIME_STEP);
    star.vel = star.vel.add(deltaVelocity);

    // Update position using the new velocity: Δp = v_new * Δt
    star.pos = star.pos.add(star.vel.mul(TIME_STEP));
  });

  // 2. Calculate and update galaxy velocities
  for (const galaxy of galaxies) {
    let totalAcceleration = Vec3.zero();
    for (const otherGalaxy of galaxies) {
      // A galaxy isn't affected by its own gravity
      if (galaxy === otherGalaxy) continue;

      // Get the vector from the current galaxy to the other galaxy
      const dPos = otherGalaxy.pos.sub(galaxy.pos);
      const distSq = dPos.magnitude ** 2;

      if (distSq === 0) continue;

      // Calculate the acceleration vector using the same physics as for the stars
      const dist = Math.sqrt(distSq);
      const accelerationScalar = (G * otherGalaxy.mass) / (dist * distSq);
      const accelerationVec = dPos.mul(accelerationScalar);

      totalAcceleration = totalAcceleration.add(accelerationVec);
    }

    // Update the galaxy's velocity based on the total acceleration
    const deltaVelocity = totalAcceleration.mul(TIME_STEP);
    galaxy.vel = galaxy.vel.add(deltaVelocity);
  }

  // 3. Update galaxy positions
  // This is done in a separate loop after all velocities have been calculated
  // to ensure that all interactions in this time step use the positions from
  // the beginning of the step (a key part of the Symplectic Euler method).
  for (const galaxy of galaxies) {
    galaxy.pos = galaxy.pos.add(galaxy.vel.mul(TIME_STEP));
  }
};

/**
 * This file contains functions to procedurally generate the initial state
 * of the galaxy simulation, creating a realistic and visually interesting starting setup.
 */

/**
 * Options for creating a random galaxy.
 */
export type GalaxyOptions = {
  // The minimum number of stars in a galaxy.
  minStarCount?: number;
  // The maximum number of stars in a galaxy. If set, a random count between min and max is used.
  maxStarCount?: number;
  // The minimum radius of the galaxy's star disk.
  minGalaxyRadius?: number;
  // The maximum radius of the galaxy's star disk.
  maxGalaxyRadius?: number;
  // The maximum speed at which a galaxy is initially moving.
  maxInitialSpeed?: number;
  // How many "time steps" to rewind a galaxy's position to avoid starting at the center.
  rewindTimeSteps?: number;
  // A random offset to prevent direct head-on collisions.
  initialCollisionAvoidanceOffset?: number;
};

/**
 * Creates a random galaxy with a given number of stars and a random velocity.
 * The galaxy is positioned to be flying towards the center of the simulation,
 * but offset to encourage orbiting rather than direct collisions.
 * @param options - The options for creating the galaxy.
 * @returns The created galaxy.
 */
export const createRandomGalaxy = (options: GalaxyOptions) => {
  const {
    minStarCount = 1500,
    maxStarCount,
    minGalaxyRadius = 1,
    maxGalaxyRadius,
    maxInitialSpeed = 4,
    rewindTimeSteps = 3,
    initialCollisionAvoidanceOffset = 1.5,
  } = options;

  // 1. Set the galaxy's overall motion in the simulation world.
  const initialVelocity = Vec3.randomCentered(maxInitialSpeed);

  // 2. Calculate the galaxy's starting position.
  // This is a clever trick to avoid starting all galaxies at the center (0,0,0).
  // We "rewind" the galaxy's position along its velocity vector, placing it
  // where it would have been a few time steps ago.
  const rewindVector = initialVelocity.mul(-rewindTimeSteps);

  // Then, we add a small random offset. This knocks the galaxy off a perfect
  // head-on collision course, making interactions more dynamic.
  const initialPosition = rewindVector.add(Vec3.randomCentered(initialCollisionAvoidanceOffset));

  // 3. Set the galaxy's tilt (orientation in 3D space).
  const rotation = Vec3.random(Math.PI);

  // 4. Determine the galaxy's size and star count from the given ranges.
  const targetNumberOfStars = maxStarCount
    ? Math.random() * (maxStarCount - minStarCount) + minStarCount
    : minStarCount;
  const galaxyRadius = maxGalaxyRadius
    ? Math.random() * (maxGalaxyRadius - minGalaxyRadius) + minGalaxyRadius
    : minGalaxyRadius;

  const galaxy = new Galaxy(initialVelocity, initialPosition, rotation, targetNumberOfStars);

  // Pre-calculate the rotation matrix. This is more efficient than
  // re-calculating it for every single star.
  const rotationMatrix = Matrix3x3.fromEuler(
    galaxy.rotation.x,
    galaxy.rotation.y,
    galaxy.rotation.z,
  );

  // 5. Populate the galaxy with stars.
  for (let i = 0; i < targetNumberOfStars; i++) {
    galaxy.stars.push(createRandomStarInGalaxy(galaxy, rotationMatrix, galaxyRadius));
  }

  return galaxy;
};

/**
 * Creates a single random star within a galaxy, giving it a position and orbital velocity.
 * @param galaxy - The galaxy the star belongs to.
 * @param rotationMatrix - The pre-calculated rotation matrix of the galaxy.
 * @param galaxyRadius - The radius of the galaxy's star disk.
 * @returns The created star.
 */
const createRandomStarInGalaxy = (
  galaxy: Galaxy,
  rotationMatrix: Matrix3x3,
  galaxyRadius: number = 1,
) => {
  // --- Create the star in the galaxy's LOCAL coordinate system ---

  // 1. Define the star's position on the flat galactic disk.
  const angularPosition = 2 * Math.PI * Math.random(); // Random angle (0 to 2PI)
  const distanceFromCenter = Math.random() * galaxyRadius; // Random distance from center

  // 2. Define the star's height above/below the galactic disk.
  // We use exponential decay `Math.exp(-x)` to ensure most stars are near the
  // central plane, creating a realistic disk with a central bulge.
  let heightFromPlane =
    ((Math.random() * Math.exp(-2 * (distanceFromCenter / galaxyRadius))) / 5) * galaxyRadius;
  if (Math.random() < 0.5) {
    heightFromPlane = -heightFromPlane; // 50% chance to be below the plane
  }

  // 3. Calculate the star's orbital speed.
  // This uses the formula for orbital velocity: v = sqrt(G * M / r)
  // where G is the gravitational constant (0.001 in our simulation),
  // M is the mass of the galaxy, and r is the star's distance from the center.
  const distanceToCenter3D = Math.sqrt(distanceFromCenter ** 2 + heightFromPlane ** 2);
  const orbitalSpeed = Math.sqrt((galaxy.mass * G) / distanceToCenter3D);

  // 4. Create local position and velocity vectors.
  const sinW = Math.sin(angularPosition);
  const cosW = Math.cos(angularPosition);

  const localPosition = new Vec3(
    distanceFromCenter * cosW,
    distanceFromCenter * sinW,
    heightFromPlane,
  );

  // The velocity vector is set perpendicular to the position vector to create
  // a circular orbit. (For a position (x,y), a perpendicular vector is (-y,x)).
  const localVelocity = new Vec3(-orbitalSpeed * sinW, orbitalSpeed * cosW, 0);

  // --- Transform local coordinates to WORLD coordinates ---

  // 5. Apply the galaxy's rotation to the star's local position and velocity.
  const worldPosition = rotationMatrix.transform(localPosition).add(galaxy.pos);
  const worldVelocity = rotationMatrix.transform(localVelocity).add(galaxy.vel);

  return new Star(worldPosition, worldVelocity);
};
