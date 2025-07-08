import { css, html, LitElement } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { Galaxy } from '../astro';
import { createRandomGalaxy, updateGalaxies } from '../physics/simple';
import { allStars } from '../physics/util';

/**
 * A simplified, self-contained web component for displaying a galaxy simulation.
 *
 * This component is designed as an easy-to-understand starting point. It hard-codes
 * the simulation parameters (e.g., always creates 3 galaxies) and removes all
 * complex configuration options for simplicity.
 *
 * @customElement simple-galaxy-simulation
 */
@customElement('simple-galaxy-simulation')
export class SimpleGalaxySimulation extends LitElement {
  // --- Element Properties ---

  /**
   * A reference to the <canvas> element in the component's shadow DOM.
   * The `@query` decorator automatically finds and assigns the element.
   */
  @query('#galaxyCanvas')
  private _canvas!: HTMLCanvasElement;

  /**
   * The 2D rendering context of the canvas, used for all drawing operations.
   */
  private _ctx: CanvasRenderingContext2D | null = null;

  /**
   * An array holding all the galaxy objects currently in the simulation.
   */
  private _galaxies: Galaxy[] = [];

  /**
   * The ID returned by `requestAnimationFrame`, used to start and stop the animation loop.
   */
  private _animationFrameId: number | null = null;

  /**
   * An observer that detects when the component's size changes, so we can
   * resize the canvas accordingly.
   */
  private _resizeObserver!: ResizeObserver;

  /**
   * The current step of the simulation.
   *
   * We use this so we can reset the simulation after a certain number of steps.
   */
  private _step = 0;

  // --- Styles ---

  static styles = css`
    /* Styles for the host element itself (<simple-galaxy-simulation>) */
    :host {
      display: block; /* Ensures the component takes up layout space */
      width: 100%;
      height: 100%;
      overflow: hidden; /* Hides anything drawn outside the component's bounds */
    }
    /* Styles for the canvas element inside the component */
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  `;

  // --- Rendering ---

  /**
   * Renders the component's HTML structure. In this case, it's just a single canvas.
   */
  render() {
    return html`<canvas id="galaxyCanvas"></canvas>`;
  }

  // --- Lifecycle Methods ---

  /**
   * Called once after the component's template has been rendered for the first time.
   * This is the ideal place for one-time setup tasks.
   */
  firstUpdated() {
    this._ctx = this._canvas.getContext('2d');

    // Set up the resize observer to call _handleResize whenever the component is resized.
    this._resizeObserver = new ResizeObserver(() => this._handleResize());
    this._resizeObserver.observe(this);

    // Initialise the simulation and start the animation loop.
    this._initialiseSimulation();
    this._startAnimation();
  }

  /**
   * Called when the component is removed from the DOM.
   * This is crucial for cleanup to prevent memory leaks.
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopAnimation();
    this._resizeObserver.disconnect();
  }

  // --- Simulation Logic ---

  /**
   * Sets up the initial state of the simulation.
   */
  private _initialiseSimulation() {
    // Hard-code the number of galaxies to 3 for simplicity.
    const galaxyCount = 3;
    this._galaxies = [];

    // Define some bright, distinct colors for our galaxies.
    const colors = ['#ffadad', '#a0c4ff', '#fdffb6'];

    for (let i = 0; i < galaxyCount; i++) {
      // Create a galaxy with some reasonable default parameters.
      const galaxy = createRandomGalaxy({
        minStarCount: 700,
        maxStarCount: 1000,
        minGalaxyRadius: 0.5,
        maxGalaxyRadius: 1.5,
      });

      // Assign a color to the galaxy so we can identify it visually.
      galaxy.data.color = colors[i % colors.length];
      this._galaxies.push(galaxy);
    }
  }

  /**
   * The main animation loop, called for every frame.
   */
  private _animate = () => {
    // 1. Advance the physics simulation by one step.
    updateGalaxies(this._galaxies);

    // 2. Draw the new state of the simulation onto the canvas.
    this._draw();

    // 3. Request the next frame, creating an infinite loop.
    this._animationFrameId = requestAnimationFrame(this._animate);

    this._step++;

    if (this._step > 1500) {
      this._step = 0;
      this._initialiseSimulation();
    }
  };

  /**
   * Draws the current state of all galaxies and stars to the canvas.
   */
  private _draw() {
    if (!this._ctx || !this._canvas) return; // Exit if canvas isn't ready.

    const { width, height } = this._canvas;

    // This is a common trick for animations: instead of clearing the canvas completely,
    // we draw a semi-transparent black rectangle over it. This creates a "trail"
    // effect behind the moving stars.
    this._ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this._ctx.fillRect(0, 0, width, height);

    // This factor controls the zoom level. A larger number makes the galaxies appear bigger.
    const viewScale = (width + height) / 40;

    // Iterate through every star in every galaxy.
    allStars(this._galaxies, (star, galaxy) => {
      // Set the drawing color to the star's galaxy color.
      this._ctx!.fillStyle = galaxy.data.color as string;

      // Project the star's 3D position (x, y) onto the 2D screen.
      // We translate it by half the canvas width/height to center the view.
      const screenX = Math.floor(star.pos.x * viewScale) + width / 2;
      const screenY = Math.floor(star.pos.y * viewScale) + height / 2;

      // Only draw the star if it's within the visible canvas area.
      // This is a small performance optimization.
      if (screenX >= 0 && screenX < width && screenY >= 0 && screenY < height) {
        this._ctx!.fillRect(screenX, screenY, 1, 1); // Draw the star as a 1x1 pixel.
      }
    });
  }

  // --- Control and Utility Methods ---

  /**
   * Starts the animation loop if it's not already running.
   */
  private _startAnimation() {
    if (!this._animationFrameId) {
      this._animate();
    }
  }

  /**
   * Stops the animation loop.
   */
  private _stopAnimation() {
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
  }

  /**
   * Handles resizing of the canvas to match the component's dimensions.
   * This also accounts for high-DPI (e.g., Retina) displays.
   */
  private _handleResize() {
    if (!this._canvas) return;
    // Use the device's pixel ratio to render at the screen's native resolution.
    const dpr = window.devicePixelRatio || 1;
    this._canvas.width = this.clientWidth * dpr;
    this._canvas.height = this.clientHeight * dpr;
  }
}
