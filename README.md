# Galaxy-JS

This project is a JavaScript port of the classic `galaxy` [screensaver](https://github.com/Zygo/xscreensaver/blob/master/hacks/galaxy.c),
a personal favorite for many from the [XScreenSaver](https://www.jwz.org/xscreensaver/) (`xlockmore`) collection of the 1990s.

Even today, it stands as a beautiful example of a simple 3D particle simulation that produces complex and aesthetically pleasing results. The animation showcases surprisingly realistic-looking galactic interactions, with recognizable features like tidal tails and mergers that emerge from simple physical laws.

## The Simulation: A Glimpse Under the Hood

While named "galaxy," the simulation more accurately models a system of massive central bodies (akin to super-massive black holes) whose gravitational forces influence a large number of surrounding, massless "stars."

The core of the simulation is a simplified **n-body calculation**:

- The gravitational pull of each galaxy's central mass on every single star in the simulation is calculated in each step.
- The gravitational forces between the central masses of the galaxies themselves are also calculated, causing the galaxies to orbit and interact with each other.
- To make the computation feasible, the gravitational interactions between individual stars are ignored.

The force is calculated using an inverse-square law, which is a direct application of [Newton's Law of Universal Gravitation](https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation) ($F = G \frac{m_1 m_2}{r^2}$). This simplified model is computationally efficient yet powerful enough to generate the mesmerizing, life-like galactic spirals, collisions, and mergers seen in the animation.

## The Physics of the Simulation

The simulation uses a numerical integration method to approximate the motion of celestial bodies over time. Specifically, it employs a [Symplectic Euler](https://en.wikipedia.org/wiki/Symplectic_integrator) integrator, a simple yet effective method that provides long-term stability for orbital simulations.

Unlike the standard [Euler method](https://en.wikipedia.org/wiki/Euler_method), which can cause orbits to drift and gain energy over time, the Symplectic Euler method conserves energy much more accurately. This prevents stars from unnaturally spiraling out of their galaxies and ensures the simulation remains stable and realistic.

The update for each object (a star or a galaxy's central mass) happens in discrete time steps (`Δt`) and follows this sequence:

1. **Calculate Acceleration (`a`)**: The simulation first calculates the total gravitational acceleration acting on an object. It sums up the acceleration vectors caused by every massive body in the system. The acceleration vector towards a single mass `M` is given by:
   $$\vec{a} = G \frac{M}{r^3} \vec{r}$$
   where `G` is the gravitational constant, `M` is the mass of the attracting body, and `r` is the vector pointing from the object to the attracting body.

2. **Update Velocity (`v`)**: The object's velocity is updated using the calculated acceleration and the time step `Δt`:
   $$\vec{v}\_{new} = \vec{v}\_{old} + \vec{a} \cdot \Delta t$$

3. **Update Position (`p`)**: Finally, the object's position is updated using this **newly calculated velocity**. This is the key step that defines the Symplectic Euler method and gives it its stability.
   $$\vec{p}\_{new} = \vec{p}\_{old} + \vec{v}_{new} \cdot \Delta t$$

This process is repeated for every object in every frame, creating the fluid and dynamic motion of the simulation.

### Initial Conditions

The simulation's beautiful starting patterns are also rooted in physics:

- **Galaxy Placement**: Galaxies are initially "rewound" in time and given a slight sideways offset. This clever trick ensures they start off-screen and fly towards the center on paths that encourage near-misses and orbiting rather than direct, head-on collisions.
- **Galaxy Shape**: The classic spiral shape is formed by placing stars with an exponential decay in their height from the central plane, creating a thin disk with a central bulge.
- **Orbital Velocity**: Each star is given an initial velocity based on the formula for a stable circular orbit, $$v = \sqrt{\frac{GM}{r}}$$, which makes the galaxies spin realistically from the very first frame.

## The Web Component

The web component is a simple wrapper around the simulation that allows it to be used in a web page. It is a custom element that can be used like this:

```html
<html>
    <head>
        <title>Galaxies</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://unpkg.com/@kajws/galaxy-js"></script>
    </head>
    <body>
        <h1>Galaxies</h1>
        <galaxy-simulation style="width: 600px; height: 400px;" >
    </body>
</html>
```

### Component Properties

The `<galaxy-simulation>` web component can be configured through the following properties, which can be set as HTML attributes on the `<galaxy-simulation>` tag.

- `galaxy-count`: The minimum number of galaxies to create. The actual number will be a random value between `galaxy-count` and `max-galaxy-count`. Defaults to `3`.
- `max-galaxy-count`: The maximum number of galaxies to create. Defaults to `3`.
- `zoom`: A number that adjusts the zoom level of the camera. Defaults to `1`.
- `rotation`: Controls the rotation of the view in degrees per frame. It can be set in two ways:
  - As a single number (e.g., `rotation="0.2"`): This sets the rotation speed around a randomly chosen axis.
  - As a comma-separated string (e.g., `rotation="0.1,0.2,0"`): This sets the rotation speeds for the x, y, and z axes respectively.
- `simulator`: For advanced use cases, you can provide a custom JavaScript object to override the default physics engine. It must provide an `updateGalaxies(galaxies)` method.
- `galaxy-factory`: Similarly, this allows providing a custom object to override galaxy creation. It must provide a `createRandomGalaxy()` method.

In addition there is a [&lt;simple-galaxy-simulation&gt;](./src/web/simple.ts) web component that is a bare-bones version of the simulation. This is a good starting point for anyone wanting to develop their own custom rendering of the simulation.

### 3D

The simulation universe is a 3D space, which means we can render a fully 3D scene. A separate project [@kajws/galaxy-vr](https://github.com/kws/galaxy-vr) shows how to use THREE.js and WebXR to render a VR-compatible 3D scene.

## History and Acknowledgements

This code has a long and storied history, evolving through several platforms and authors. This port would not be possible without their original work. Full credit belongs to the creators and contributors who have maintained this program over the decades.

- **Original Author:** The simulation was first written by **Uli Siegmund** on an Amiga for EGS in Cluster.
- **Early Ports:** It was subsequently ported to C/Intuition by **Harald Backert**.
- **X11 and Xlockmore:** The version most people are familiar with was ported to X11 and incorporated into the `xlockmore` screensaver collection by **Hubert Feyrer** in 1994. Hubert also added the initial color support.

There have also been previous ports to JavaScript, most notably [rtoal/galaxies](https://github.com/rtoal/galaxies) which provided a useful reference for this port.

## Aims

However, unlike the other ports, I wanted this to be more 'simulator' than just a visualisation with the hope that it may also be useful for educational purposes. The physical objects, the
vector and matrix operations, and the simulation itself are all separated in the hope that this can either be extended or used as a starting point for other projects.

Finally, I've also included a simple webcomponent as well as a more complex configurable version that can be dropped into any web page. If you are a teacher or a student using this project, I would love to hear from you!

## License

In the spirit of the original, this JavaScript port is released under a permissive, non-restrictive license. The original C code included the following grant of permission:

> Originally done by Uli Siegmund &lt;<uli@wombat.okapi.sub.org>&gt; on Amiga for EGS in Cluster
>
> Port from Cluster/EGS to C/Intuition by Harald Backert
>
> Port to X11 and incorporation into xlockmore by Hubert Feyrer &lt;<hubert.feyrer@rz.uni-regensburg.de>&gt;
>
> Permission to use, copy, modify, and distribute this software and its documentation for any purpose and without fee is hereby granted, provided that the above copyright notice appear in all copies and that both that copyright notice and this permission notice appear in supporting documentation. This file is provided AS IS with no warranties of any kind.

This port is a significant rewrite aimed at expanding the physics and making the code more accessible for modern educational purposes. To honor the permissive spirit of the original while providing legal clarity, this new work is released under the MIT License.

The MIT License is fully compatible with the original terms and is a widely recognized standard, ensuring the code remains easy to use, share, and build upon.
