import { randomAngle } from './angles';
import { Vec3 } from './vector';

/**
 * Represents a 3x3 matrix for 3D transformations.
 *
 * A 3x3 matrix is a mathematical object that can represent:
 * - Rotations in 3D space
 * - Scaling transformations
 * - Linear transformations of 3D vectors
 *
 * The matrix is stored as a 2D array where:
 * - data[i][j] represents the element at row i, column j
 * - Rows and columns are indexed from 0 to 2
 */
export class Matrix3x3 {
  private data: number[][];

  /**
   * Creates a new 3x3 matrix from the provided data.
   *
   * @param data - A 2D array representing the matrix values
   * @throws Error if the data doesn't form a valid 3x3 matrix
   */
  constructor(data: number[][]) {
    // Validate that we have exactly 3 rows
    if (data.length !== 3) {
      throw new Error(`Matrix must have 3 rows, got ${data.length}`);
    }

    // Validate that each row has exactly 3 columns
    for (let i = 0; i < data.length; i++) {
      if (data[i].length !== 3) {
        throw new Error(`Row ${i} must have 3 columns, got ${data[i].length}`);
      }
    }

    // Create a deep copy to prevent external modifications
    this.data = data.map((row) => [...row]);
  }

  /**
   * Creates the identity matrix.
   *
   * The identity matrix is a special matrix that:
   * - Has 1s on the main diagonal (top-left to bottom-right)
   * - Has 0s everywhere else
   * - When multiplied by any vector, returns the same vector unchanged
   *
   * Identity matrix structure:
   * [1  0  0]
   * [0  1  0]
   * [0  0  1]
   *
   * @returns A new identity matrix
   */
  static identity(): Matrix3x3 {
    return new Matrix3x3([
      [1, 0, 0], // First row: [1, 0, 0]
      [0, 1, 0], // Second row: [0, 1, 0]
      [0, 0, 1], // Third row: [0, 0, 1]
    ]);
  }

  /**
   * Creates a rotation matrix from Euler angles.
   *
   * This method creates a rotation matrix that combines:
   * - x: Rotation around the x-axis (roll)
   * - y: Rotation around the y-axis (pitch)
   * - z: Rotation around the z-axis (yaw)
   *
   * The resulting matrix can be used to rotate 3D vectors in space.
   *
   * @param x - Rotation angle around x-axis in radians
   * @param y - Rotation angle around y-axis in radians
   * @param z - Rotation angle around z-axis in radians
   * @returns A new rotation matrix
   */
  static fromEuler(x: number, y: number, z: number): Matrix3x3 {
    const cx = Math.cos(x),
      sx = Math.sin(x);
    const cy = Math.cos(y),
      sy = Math.sin(y);
    const cz = Math.cos(z),
      sz = Math.sin(z);

    return new Matrix3x3([
      [cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx],
      [sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx],
      [-sy, cy * sx, cy * cx],
    ]);
  }

  /**
   * Creates a random rotation matrix.
   *
   * This is useful for generating random orientations in 3D space,
   * such as for stars or other objects in a galaxy simulation.
   *
   * @returns A new matrix with random rotation angles
   */
  static randomRotation(): Matrix3x3 {
    // Generate random angles between 0 and 2π (full circle)
    const x = randomAngle();
    const y = randomAngle();
    const z = randomAngle();
    return Matrix3x3.fromEuler(x, y, z);
  }

  /**
   * Creates a rotation matrix from an axis and an angle.
   *
   * @param axis - The axis of rotation
   * @param angle - The angle of rotation in radians
   * @returns A new rotation matrix
   */
  static fromAxisAngle(axis: Vec3, angle: number): Matrix3x3 {
    const x = axis.x;
    const y = axis.y;
    const z = axis.z;

    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c; // "t" for one-minus-cosine

    // Elements of the rotation matrix based on Rodrigues' formula
    const m00 = t * x * x + c;
    const m01 = t * x * y - z * s;
    const m02 = t * x * z + y * s;

    const m10 = t * y * x + z * s;
    const m11 = t * y * y + c;
    const m12 = t * y * z - x * s;

    const m20 = t * z * x - y * s;
    const m21 = t * z * y + x * s;
    const m22 = t * z * z + c;

    // Assuming your matrix constructor takes the elements in row-major order
    return new Matrix3x3([
      [m00, m01, m02],
      [m10, m11, m12],
      [m20, m21, m22],
    ]);
  }

  /**
   * Transforms a 3D vector by multiplying it with this matrix.
   *
   * Matrix-vector multiplication formula:
   * result.x = matrix[0][0] * vec.x + matrix[1][0] * vec.y + matrix[2][0] * vec.z
   * result.y = matrix[0][1] * vec.x + matrix[1][1] * vec.y + matrix[2][1] * vec.z
   * result.z = matrix[0][2] * vec.x + matrix[1][2] * vec.y + matrix[2][2] * vec.z
   *
   * @param vec - The 3D vector to transform
   * @returns A new transformed vector
   */
  transform(vec: Vec3): Vec3 {
    // Matrix-vector multiplication: result = matrix * vector
    // Each component of the result is a dot product of a matrix row with the vector
    return new Vec3(
      // X component: dot product of first matrix column with vector
      this.data[0][0] * vec.x + this.data[1][0] * vec.y + this.data[2][0] * vec.z,
      // Y component: dot product of second matrix column with vector
      this.data[0][1] * vec.x + this.data[1][1] * vec.y + this.data[2][1] * vec.z,
      // Z component: dot product of third matrix column with vector
      this.data[0][2] * vec.x + this.data[1][2] * vec.y + this.data[2][2] * vec.z,
    );
  }

  /**
   * Multiplies this matrix by another matrix.
   *
   * Matrix multiplication is not commutative (A * B ≠ B * A).
   * The result represents the combined effect of applying both transformations.
   *
   * Matrix multiplication formula:
   * result[i][j] = sum(k=0 to 2) of this[i][k] * other[k][j]
   *
   * @param other - The matrix to multiply with
   * @returns A new matrix representing the product
   */
  mul(other: Matrix3x3): Matrix3x3 {
    const result: number[][] = [];

    // Iterate through each row of the first matrix
    for (let i = 0; i < 3; i++) {
      result[i] = [];
      // Iterate through each column of the second matrix
      for (let j = 0; j < 3; j++) {
        result[i][j] = 0;
        // Compute the dot product of row i from first matrix with column j from second matrix
        for (let k = 0; k < 3; k++) {
          result[i][j] += this.data[i][k] * other.data[k][j];
        }
      }
    }

    return new Matrix3x3(result);
  }

  /**
   * Gets the element at the specified row and column position.
   *
   * Matrix indexing is zero-based:
   * - Row 0: top row
   * - Row 1: middle row
   * - Row 2: bottom row
   * - Column 0: left column
   * - Column 1: middle column
   * - Column 2: right column
   *
   * @param row - Row index (0-2)
   * @param col - Column index (0-2)
   * @returns The matrix element at the specified position
   */
  get(row: number, col: number): number {
    return this.data[row][col];
  }

  /**
   * Sets the element at the specified row and column position.
   *
   * @param row - Row index (0-2)
   * @param col - Column index (0-2)
   * @param value - The value to set at the specified position
   */
  set(row: number, col: number, value: number): void {
    this.data[row][col] = value;
  }

  /**
   * Returns a copy of the matrix data as a 2D array.
   *
   * This creates a deep copy, so modifying the returned array
   * won't affect the original matrix.
   *
   * @returns A 2D array representation of the matrix
   */
  toArray(): number[][] {
    // Create a deep copy to prevent external modifications
    return this.data.map((row) => [...row]);
  }

  /**
   * Converts the matrix to Euler angles.
   *
   * @returns A new vector with the Euler angles
   */
  toEuler(): Vec3 {
    return new Vec3(
      Math.atan2(this.data[2][1], this.data[2][2]),
      Math.asin(-this.data[2][0]),
      Math.atan2(this.data[1][0], this.data[0][0]),
    );
  }
}
