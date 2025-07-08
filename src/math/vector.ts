/**
 * Represents a 3D vector.
 *
 * A 3D vector is a mathematical object that represents:
 * - A point in 3D space (x, y, z coordinates)
 * - A direction and magnitude in 3D space
 * - A displacement from one point to another
 *
 * This class provides common vector operations like:
 * - Addition, subtraction, multiplication, division
 * - Magnitude calculation and normalization
 * - Random vector generation
 *
 * Vectors are immutable - operations return new vectors rather than modifying existing ones.
 */
export class Vec3 {
  x: number;
  y: number;
  z: number;

  /**
   * Creates a new 3D vector.
   *
   * @param x - X coordinate (default: 0)
   * @param y - Y coordinate (default: 0)
   * @param z - Z coordinate (default: 0)
   */
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Creates a new 3D vector with all components set to 0.
   *
   * @returns A new vector with all components set to 0
   */
  static zero() {
    return new Vec3(0, 0, 0);
  }

  /**
   * Creates a random vector with components between 0 and 1, then scales it.
   *
   * This is useful for generating random positions or directions in 3D space.
   * Each component is a random value between 0 and 1, then multiplied by the factor.
   *
   * @param factor - Scaling factor to multiply the random components by (default: 1)
   * @returns A new random vector
   */
  static random(factor: number = 1) {
    // Create vector with random components between 0 and 1, then scale
    return new Vec3(Math.random(), Math.random(), Math.random()).mul(factor);
  }

  /**
   * Creates a random vector centered around the origin.
   *
   * This generates a random vector with components between -0.5 and 0.5,
   * then scales it by the factor. This is useful for generating random
   * positions around a center point.
   *
   * @param factor - Scaling factor to multiply the centered random components by (default: 1)
   * @returns A new random centered vector
   */
  static randomCentered(factor: number = 1) {
    // Generate random vector, subtract 0.5 to center around origin, then scale
    return Vec3.random().sub(0.5).mul(factor);
  }

  /**
   * Calculates the magnitude (length) of this vector.
   *
   * The magnitude is the distance from the origin to the point represented by this vector.
   * It's calculated using the Pythagorean theorem: √(x² + y² + z²)
   *
   * @returns The magnitude (length) of the vector
   */
  get magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  /**
   * Creates a copy of this vector.
   *
   * Since vectors are immutable, this is useful when you need to
   * create a new vector with the same values as an existing one.
   *
   * @returns A new vector with the same x, y, z values
   */
  copy() {
    return new Vec3(this.x, this.y, this.z);
  }

  /**
   * Subtracts another vector or scalar from this vector.
   *
   * Vector subtraction: (x1, y1, z1) - (x2, y2, z2) = (x1-x2, y1-y2, z1-z2)
   * Scalar subtraction: (x, y, z) - s = (x-s, y-s, z-s)
   *
   * @param other - Vector or scalar to subtract
   * @returns A new vector representing the difference
   */
  sub(other: Vec3 | number) {
    if (typeof other === 'number') {
      // Scalar subtraction: subtract the number from each component
      return new Vec3(this.x - other, this.y - other, this.z - other);
    }
    // Vector subtraction: subtract corresponding components
    return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  /**
   * Adds another vector or scalar to this vector.
   *
   * Vector addition: (x1, y1, z1) + (x2, y2, z2) = (x1+x2, y1+y2, z1+z2)
   * Scalar addition: (x, y, z) + s = (x+s, y+s, z+s)
   *
   * @param other - Vector or scalar to add
   * @returns A new vector representing the sum
   */
  add(other: Vec3 | number) {
    if (typeof other === 'number') {
      // Scalar addition: add the number to each component
      return new Vec3(this.x + other, this.y + other, this.z + other);
    }
    // Vector addition: add corresponding components
    return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  /**
   * Multiplies this vector by another vector or scalar.
   *
   * Vector multiplication (component-wise): (x1, y1, z1) * (x2, y2, z2) = (x1*x2, y1*y2, z1*z2)
   * Scalar multiplication: (x, y, z) * s = (x*s, y*s, z*s)
   *
   * Note: This is component-wise multiplication, not the dot product.
   * For dot product, you would use: vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z
   *
   * @param other - Vector or scalar to multiply by
   * @returns A new vector representing the product
   */
  mul(other: Vec3 | number) {
    if (typeof other === 'number') {
      // Scalar multiplication: multiply each component by the number
      return new Vec3(this.x * other, this.y * other, this.z * other);
    }
    // Component-wise vector multiplication: multiply corresponding components
    return new Vec3(this.x * other.x, this.y * other.y, this.z * other.z);
  }

  /**
   * Divides this vector by another vector or scalar.
   *
   * Vector division (component-wise): (x1, y1, z1) / (x2, y2, z2) = (x1/x2, y1/y2, z1/z2)
   * Scalar division: (x, y, z) / s = (x/s, y/s, z/s)
   *
   * @param other - Vector or scalar to divide by
   * @returns A new vector representing the quotient
   */
  div(other: Vec3 | number) {
    if (typeof other === 'number') {
      // Scalar division: divide each component by the number
      return new Vec3(this.x / other, this.y / other, this.z / other);
    }
    // Component-wise vector division: divide corresponding components
    return new Vec3(this.x / other.x, this.y / other.y, this.z / other.z);
  }

  /**
   * Normalizes this vector (makes it a unit vector).
   *
   * A normalized vector has a magnitude of 1 and points in the same direction as the original.
   * This is useful when you need a direction vector without caring about magnitude.
   *
   * Formula: normalized = vector / magnitude
   *
   * @returns A new normalized vector (magnitude = 1)
   */
  normalize() {
    // Divide the vector by its magnitude to get a unit vector
    return this.div(this.magnitude);
  }
}
