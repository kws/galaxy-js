import { Vec3 } from '../math';
import { Star } from './star';

/*
 * A galxay exists within a universe and has a mass, size, vel, pos, mat, and stars.
 */
export class Galaxy {
  vel: Vec3;
  pos: Vec3;
  rotation: Vec3;
  mass: number;
  stars: Star[] = [];
  data: Record<string, unknown> = {};

  constructor(vel: Vec3, pos: Vec3, rotation: Vec3, mass: number) {
    if (!vel) {
      throw new Error('Velocity is required');
    }
    if (!pos) {
      throw new Error('Position is required');
    }
    if (!rotation) {
      throw new Error('Rotation is required');
    }
    this.vel = vel;
    this.pos = pos;
    this.rotation = rotation;
    this.mass = mass;
  }
}
