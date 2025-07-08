import { Vec3 } from '../math';

/**
 * A star. Stars have a position, velocity, and mass.
 */
export class Star {
  pos: Vec3;
  vel: Vec3;
  mass: number;
  data: Record<string, unknown> = {};

  constructor(pos: Vec3, vel: Vec3, mass: number = 0) {
    if (!pos) {
      throw new Error('Position is required');
    }
    if (!vel) {
      throw new Error('Velocity is required');
    }

    this.pos = pos;
    this.vel = vel;
    this.mass = mass;
  }
}
