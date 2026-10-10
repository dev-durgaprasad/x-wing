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

The experience features an authentic textured X-Wing starfighter model (`source/textured_x-wing_low_poly.glb`) loaded via Three.js `GLTFLoader` at the center of the hero stage, rendered with cinematic PBR lighting, subtle deep-space hovering physics, and interactive 3D drag-to-rotate inspection. As you scroll into the engineering sections, procedural Three.js component assemblies open into the exploded diagnostic view (canopy, flight deck, reactor core, ion turbines, and modular airframe), reassembling seamlessly for the final hyperdrive departure sequence.

## Interaction

Scroll controls the camera, separation distance, system close-ups, return to assembly, and departure. Scrolling upward reverses the same states. The sound switch starts a quiet synthetic hum only after user interaction; it can be switched off at any time. The replay button returns to the top of the sequence.
