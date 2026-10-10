# X-WING / Anatomy of a Starship

A cinematic, scroll-controlled 3D concept site for a fictional XW-01 starfighter. The ship is built from individual Three.js meshes and transform groups so its hull, canopy, four S-foils, four engine pods, turbine internals, reactor, and structural braces can separate and return to their assembled positions.

## Run locally

The page uses ES modules, so serve this folder over HTTP rather than opening `index.html` directly. Node.js is enough; there is no package install:

```sh
node preview-server.js
```

Then open `http://127.0.0.1:8000` in a WebGL-capable browser. Press Ctrl+C in the terminal to stop the server. Three.js and GSAP/ScrollTrigger load from jsDelivr, and the typography loads from Google Fonts. An internet connection is needed for those libraries and fonts.

## Project files

- `index.html` — story sections, navigation, status readouts, replay, and sound control.
- `style.css` — responsive visual system and cinematic layouts.
- `main.js` — Three.js scene, procedural ship component definitions, lighting, star field, camera choreography, and GSAP ScrollTrigger mapping.
- `preview-server.js` — tiny local HTTP server using Node's built-in modules.

## Model and concept notes

No external GLB asset is required. Major assemblies are procedural Three.js geometry, with reusable material and geometry helpers in `main.js`. This keeps the components local to the project and independently animatable. Small fasteners and dust are generated deterministically where possible; decorative micro-parts use light variation. The reactor readings, propulsion data, vehicle, and engineering details are fictional visual storytelling and are not authentic aerospace specifications.

## Interaction

Scroll controls the camera, separation distance, system close-ups, return to assembly, and departure. Scrolling upward reverses the same states. The sound switch starts a quiet synthetic hum only after user interaction; it can be switched off at any time. The replay button returns to the top of the sequence.
