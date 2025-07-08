import { css, html, LitElement, PropertyValues } from 'lit';
import { customElement, query, property } from 'lit/decorators.js';
import { Galaxy } from '../astro';
import { createRandomGalaxy, updateGalaxies } from '../physics/simple';
import { Matrix3x3, Vec3 } from '../math';
import { allStars } from '../physics/util';

export interface Simulator {
  updateGalaxies: (galaxies: Galaxy[]) => void;
}

export interface GalaxyFactory {
  createRandomGalaxy: () => Galaxy;
}

@customElement('galaxy-simulation')
export class GalaxySimulation extends LitElement {
  @property({ type: Number, attribute: 'galaxy-count' })
  galaxyCount = 3;

  @property({ type: Number, attribute: 'max-galaxy-count' })
  maxGalaxyCount = 3;

  @property({ type: Number, attribute: 'zoom' })
  zoomFactor = 1;

  @property({ type: String, attribute: 'rotation' })
  rotation = 0.1;

  @property({ type: Object, attribute: 'simulator' })
  simulator!: Simulator;

  @property({ type: Object, attribute: 'galaxy-factory' })
  galaxyFactory!: GalaxyFactory;

  @query('#galaxyCanvas')
  _canvas!: HTMLCanvasElement;

  _simulator: Simulator | null = null;
  _galaxyFactory: GalaxyFactory | null = null;
  _galaxies: Galaxy[] = [];
  _ctx: CanvasRenderingContext2D | null = null;
  _animationFrameId: number | null = null;
  _resizeObserver!: ResizeObserver;
  _step = 0;
  _rotation_vector: Vec3 | null = null;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  `;

  render() {
    return html`<canvas id="galaxyCanvas"></canvas>`;
  }

  firstUpdated() {
    this._ctx = this._canvas.getContext('2d');
    this._resizeObserver = new ResizeObserver(() => this._handleResize());
    this._resizeObserver.observe(this);
    this._handleResize();

    this._initialiseGalaxies();
    this._updateRotation();
    this._startAnimation();
  }

  updated(changedProperties: PropertyValues) {
    if (
      changedProperties.has('galaxyCount') ||
      changedProperties.has('maxGalaxyCount') ||
      changedProperties.has('simulator') ||
      changedProperties.has('galaxyFactory')
    ) {
      this._initialiseGalaxies();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopAnimation();
    this._resizeObserver.disconnect();
  }

  /**
   * Rotation can have many values. If it evaluates to false, then we just don't rotate.
   * If it's a scalar number, then we pick a random axis and use the scalar as the angular velocity.
   * If it has commas in it, then we treat each value as x-axis, y-axis, z-axis speeds
   */
  _updateRotation() {
    if (!this.rotation) {
      this._rotation_vector = null;
    } else if (
      typeof this.rotation === 'number' ||
      (typeof this.rotation === 'string' && !(this.rotation as string).includes(','))
    ) {
      const speed = Number(this.rotation); // speed is degrees per second
      const speedInRadians = speed * (Math.PI / 180);
      this._rotation_vector = Vec3.random(speedInRadians);
    } else if (typeof this.rotation === 'string') {
      const [x, y, z] = (this.rotation as string).split(',').map(Number);
      const x_rad = x * (Math.PI / 180);
      const y_rad = y * (Math.PI / 180);
      const z_rad = z * (Math.PI / 180);
      this._rotation_vector = new Vec3(x_rad, y_rad, z_rad);
    }
  }

  _initialiseGalaxies() {
    this._simulator = this.simulator || {
      updateGalaxies: updateGalaxies,
    };
    this._galaxyFactory = this.galaxyFactory || {
      createRandomGalaxy: () =>
        createRandomGalaxy({
          minStarCount: 700,
          maxStarCount: 1000,
          minGalaxyRadius: 0.5,
          maxGalaxyRadius: 1.5,
        }),
    };

    const actualGalaxyCount = Math.floor(
      Math.random() * (this.maxGalaxyCount - this.galaxyCount) + this.galaxyCount,
    );

    const randomHue = Math.random() * 360;
    const offset = 360 / actualGalaxyCount;

    this._galaxies = [];
    for (let i = 0; i < actualGalaxyCount; i++) {
      const galaxy = this._galaxyFactory.createRandomGalaxy();
      galaxy.data.color = `hsl(${randomHue + i * offset}, 50%, 80%)`;
      this._galaxies.push(galaxy);
    }

    this._step = 0;
  }

  _draw() {
    // Don't do anything if the simulator or context isn't ready.
    if (!this._ctx || !this._canvas) return;

    const width = this._canvas.width;
    const height = this._canvas.height;
    const viewScale = ((width + height) / 40) * this.zoomFactor;

    this._ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this._ctx.fillRect(0, 0, width, height);

    const ctx = this._ctx;

    const centreOfMass = this._galaxies
      .reduce((acc, galaxy) => acc.add(galaxy.pos), new Vec3(0, 0, 0))
      .div(this._galaxies.length);

    let rotationMatrix = Matrix3x3.identity(); // Default to no rotation
    if (this._rotation_vector) {
      // Get the speed (magnitude) and axis (direction) from your vector
      const speedPerFrame = this._rotation_vector.magnitude;
      const axis = this._rotation_vector.normalize();

      // Calculate the total angle based on the number of frames passed
      const totalAngle = speedPerFrame * this._step;

      // Create the complete rotation matrix in one step
      rotationMatrix = Matrix3x3.fromAxisAngle(axis, totalAngle);
    }

    allStars(this._galaxies, (star, galaxy) => {
      if (!galaxy.data.color) {
        const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        galaxy.data.color = color;
      }
      ctx.fillStyle = galaxy.data.color as string;

      const pos = rotationMatrix ? rotationMatrix.transform(star.pos) : star.pos;
      const screenX = Math.floor((pos.x - centreOfMass.x) * viewScale) + width / 2;
      const screenY = Math.floor((pos.y - centreOfMass.y) * viewScale) + height / 2;

      if (screenX >= 0 && screenX < width && screenY >= 0 && screenY < height) {
        const size = 1;
        ctx.fillRect(screenX, screenY, size, size);
      }
    });
  }

  _animate = () => {
    if (this._galaxies && this._simulator) {
      this._simulator.updateGalaxies(this._galaxies); // Tell the universe to advance one step
    }
    this._draw(); // Draw the current state

    this._step++;
    if (this._step > 1500) {
      this._initialiseGalaxies();
      this._updateRotation();
    }

    this._animationFrameId = requestAnimationFrame(this._animate);
  };

  _startAnimation() {
    if (!this._animationFrameId) {
      this._animate();
    }
  }

  _stopAnimation() {
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
  }

  _handleResize() {
    const dpr = window.devicePixelRatio || 1;
    if (this._canvas) {
      this._canvas.width = this.clientWidth * dpr;
      this._canvas.height = this.clientHeight * dpr;
    }
  }
}
