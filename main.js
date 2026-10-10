import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js';

gsap.registerPlugin(ScrollTrigger);
const canvas=document.querySelector('#scene'),loader=document.querySelector('#loader'),loaderBar=document.querySelector('.loader-line i'),loaderNum=document.querySelector('.loader-percent');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x030406);scene.fog=new THREE.FogExp2(0x030406,.012);
const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,250);camera.position.set(6,3.1,10.5);
let renderer;try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'})}catch(error){document.body.classList.add('no-webgl');canvas.hidden=true;loader.classList.add('done');const fallback=document.createElement('div');fallback.className='webgl-fallback';fallback.innerHTML='<span>WEBGL / UNAVAILABLE</span><b>XW—01</b><p>Your browser cannot display the interactive starfighter. The mission guide and specifications are still available below.</p>';document.body.append(fallback)}
if(renderer){
renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
scene.add(new THREE.HemisphereLight(0xc4d6e7,0x10151d,2.0));const key=new THREE.DirectionalLight(0xe5f0ff,3.4);key.position.set(-4,8,6);scene.add(key);const rim=new THREE.PointLight(0x67dfff,28,24);rim.position.set(2,1,-3);scene.add(rim);const warm=new THREE.PointLight(0xff5725,5,12);warm.position.set(0,1,4);scene.add(warm);
const mat=(color,metalness=.75,roughness=.32,extra={})=>new THREE.MeshStandardMaterial({color,metalness,roughness,...extra});
const alloy=mat(0x9fa8ae,.82,.29),lightAlloy=mat(0xc9cdd0,.72,.25),dark=mat(0x242a30,.88,.3),black=mat(0x080b0e,.58,.24),red=mat(0x8d2626,.4,.38),glass=mat(0x27404a,.72,.12,{transparent:true,opacity:.56}),glow=new THREE.MeshStandardMaterial({color:0xff6a24,emissive:0xff4714,emissiveIntensity:2.2,metalness:.35,roughness:.26}),cyan=new THREE.MeshStandardMaterial({color:0x39dafa,emissive:0x12a5d0,emissiveIntensity:2.4,metalness:.3,roughness:.2});
const ship=new THREE.Group();scene.add(ship);const parts={};
function group(name,pos=[0,0,0]){let g=new THREE.Group();g.name=name;g.position.set(...pos);ship.add(g);parts[name]=g;g.userData.home=g.position.clone();return g}
function childGroup(parent,name,pos=[0,0,0]){let g=new THREE.Group();g.name=name;g.position.set(...pos);parent.add(g);parts[name]=g;g.userData.home=g.position.clone();return g}
function mesh(parent,geometry,material,pos=[0,0,0],rot=[0,0,0]){let m=new THREE.Mesh(geometry,material);m.position.set(...pos);m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
const box=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
function cylinder(parent,r1,r2,len,material,pos,rot=[Math.PI/2,0,0],segments=32){return mesh(parent,new THREE.CylinderGeometry(r1,r2,len,segments,1),material,pos,rot)}
function torus(parent,r,t,material,pos,rot=[Math.PI/2,0,0]){return mesh(parent,new THREE.TorusGeometry(r,t,10,40),material,pos,rot)}
function makeWing(name,x,z,angle){let g=group(name,[x,0,z]);g.rotation.y=angle;g.scale.x=name.includes('left')?-1:1;
 const sh=new THREE.Shape();sh.moveTo(-.2,-.5);sh.lineTo(2.5,-.26);sh.lineTo(2.9,0);sh.lineTo(2.5,.26);sh.lineTo(-.2,.5);sh.closePath();
 const w=mesh(g,new THREE.ExtrudeGeometry(sh,{depth:.12,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.03}),lightAlloy,[0,-.05,0],[Math.PI/2,0,0]);
 mesh(g,box(1.8,.035,.025),red,[1.18,.03,.34]);mesh(g,box(.65,.045,.025),dark,[.25,.035,-.34]);
 // Raised armor seams and rivets create readable panel detail at close range.
 for(let i=0;i<7;i++){let x0=.22+i*.31;mesh(g,box(.018,.02,.72),alloy,[x0,.045,0]);for(let z0 of [-.31,.31])mesh(g,new THREE.SphereGeometry(.025,8,6),dark,[x0,.065,z0]);}
 for(let i=0;i<3;i++)mesh(g,box(.28,.025,.018),alloy,[1.7+i*.22,.035,0]);
 let cannon=childGroup(g,`${name}-cannon`,[2.62,.02,0]);cylinder(cannon,.07,.055,.68,dark,[0,0,-.2],[Math.PI/2,0,0],16);cylinder(cannon,.09,.09,.12,alloy,[0,0,-.55],[Math.PI/2,0,0],16);mesh(cannon,new THREE.SphereGeometry(.09,12,8),glow,[0,0,-.65]);
 let root=g;root.userData.home=root.position.clone();return g}
function makeEngine(name,x,y){let g=group(name,[x,y,1.42]);cylinder(g,.48,.39,.95,alloy,[0,0,0]);cylinder(g,.39,.35,.12,dark,[0,0,-.47]);cylinder(g,.34,.39,.12,lightAlloy,[0,0,.48]);torus(g,.39,.045,alloy,[0,0,.53]);torus(g,.29,.025,glow,[0,0,.58]);cylinder(g,.25,.21,.42,dark,[0,0,.2]);cylinder(g,.22,.15,.23,black,[0,0,.42]);torus(g,.19,.025,cyan,[0,0,.55]);
 for(let i=0;i<10;i++){let a=i*Math.PI/5;mesh(g,box(.035,.035,.55),dark,[Math.cos(a)*.405,Math.sin(a)*.405,0],[0,0,a]);}
 for(let z of [-.25,-.07,.11,.29])torus(g,.395,.012,lightAlloy,[0,0,z]);
 // Engine internals are separate transforms and are pulled outward in diagnostic view.
 let turbine=childGroup(g,`${name}-turbine`,[0,0,.25]);torus(turbine,.24,.035,alloy,[0,0,0]);for(let i=0;i<8;i++){let a=i*Math.PI/4;mesh(turbine,box(.22,.025,.04),lightAlloy,[Math.cos(a)*.12,Math.sin(a)*.12,0],[0,0,a]);}turbine.userData.home=turbine.position.clone();
 let ghome=g.position.clone();g.userData.home=ghome;return g}

// Fuselage, modular canopy, nose, and internal backbone.
const hull=group('hull',[0,0,0]);cylinder(hull,.49,.38,2.6,alloy,[0,0,.05]);cylinder(hull,.42,.34,.7,dark,[0,0,-1.25]);
mesh(hull,new THREE.ConeGeometry(.39,1.25,8),lightAlloy,[0,0,-2.15],[-Math.PI/2,0,0]);
for(let z=-1.1;z<1.2;z+=.22){torus(hull,.405,.012,dark,[0,0,z]);}
mesh(hull,box(.12,.16,2.4),dark,[0,-.38,.05]);for(let s of [-1,1]){mesh(hull,box(.035,.12,1.65),lightAlloy,[s*.31,.1,.1]);}
for(let i=0;i<10;i++){let a=i*Math.PI/5;let x=Math.cos(a)*.47,y=Math.sin(a)*.47;cylinder(hull,.03,.03,.09,dark,[x,y,-.4],[0,Math.PI/2-a,Math.PI/2],8);}
const canopy=group('canopy',[0,.43,-.85]);mesh(canopy,new THREE.SphereGeometry(.44,24,16,0,Math.PI*2,0,Math.PI/2),glass,[0,0,0],[Math.PI/2,0,0]);mesh(canopy,box(.035,.025,.72),alloy,[0,.12,0]);for(let z of [-.3,.3])mesh(canopy,box(.48,.035,.035),alloy,[0,.04,z]);
const cockpit=group('cockpit',[0,.03,-.75]);mesh(cockpit,box(.48,.28,.85),dark);mesh(cockpit,box(.29,.36,.35),black,[0,.17,.06]);cylinder(cockpit,.045,.04,.36,alloy,[0,-.05,-.24],[Math.PI/2,0,0],10);mesh(cockpit,box(.3,.08,.12),cyan,[0,.18,-.4]);
// Central reactor and openable shielding.
const reactor=group('reactor',[0,0,.2]);cylinder(reactor,.29,.29,.55,dark,[0,0,0]);torus(reactor,.31,.045,alloy,[0,0,-.25]);torus(reactor,.31,.045,alloy,[0,0,.25]);cylinder(reactor,.18,.18,.42,cyan,[0,0,0]);for(let i=0;i<8;i++){let a=i*Math.PI/4;mesh(reactor,box(.06,.07,.73),alloy,[Math.cos(a)*.34,Math.sin(a)*.34,0],[0,0,a]);}
const cage=group('reactor-cage',[0,0,.15]);for(let i=0;i<8;i++){let a=i*Math.PI/4;mesh(cage,box(.035,.035,.9),dark,[Math.cos(a)*.48,Math.sin(a)*.48,0],[0,0,a]);}
// Four independent X-foil assemblies and their splayed drive units.
makeWing('wing-upper-left',-.62,0,-.43);makeWing('wing-lower-left',-.62,.3,.43);makeWing('wing-upper-right',.62,0,.43);makeWing('wing-lower-right',.62,.3,-.43);
makeEngine('engine-upper-left',-.92,.43);makeEngine('engine-upper-right',.92,.43);makeEngine('engine-lower-left',-.92,-.43);makeEngine('engine-lower-right',.92,-.43);
// Structural pylons, exposed hydraulic pipes, and floating fasteners.
for(let s of [-1,1]){let brace=group(`brace-${s}`,[s*.72,-.04,.8]);mesh(brace,box(.1,.1,1.2),dark,[0,0,.15],[0,s*.15,0]);for(let i=0;i<5;i++){let z=-.2+i*.18;cylinder(brace,.018,.018,.55,alloy,[s*.12,.1,z],[Math.PI/2,0,0],8);}}
const micro=new THREE.Group();ship.add(micro);for(let i=0;i<85;i++){const geo=i%4===0?new THREE.BoxGeometry(.035,.035,.08):new THREE.SphereGeometry(.018,6,5);let m=mesh(micro,geo,i%5===0?red:alloy,[(Math.random()-.5)*4,(Math.random()-.5)*1.6,(Math.random()-.5)*4]);m.userData.origin=m.position.clone();m.userData.phase=Math.random()*Math.PI*2;}

// Deep-space environment: a deterministic, reusable point field plus faint dust.
let starCount=2100,positions=new Float32Array(starCount*3),sizes=new Float32Array(starCount);let seed=947;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}for(let i=0;i<starCount;i++){let r=18+rand()*85,a=rand()*Math.PI*2,b=Math.acos(2*rand()-1);positions[i*3]=r*Math.sin(b)*Math.cos(a);positions[i*3+1]=r*Math.cos(b);positions[i*3+2]=r*Math.sin(b)*Math.sin(a);sizes[i]=rand()}
const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(positions,3));const stars=new THREE.Points(sg,new THREE.PointsMaterial({color:0xc6d6e4,size:.085,transparent:true,opacity:.78,sizeAttenuation:true}));scene.add(stars);
const dustGeo=new THREE.BufferGeometry(),dustPos=new Float32Array(330*3);for(let i=0;i<330;i++){dustPos[i*3]=(rand()-.5)*28;dustPos[i*3+1]=(rand()-.5)*14;dustPos[i*3+2]=(rand()-.5)*35}dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPos,3));const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0x718599,size:.025,transparent:true,opacity:.45}));scene.add(dust);

const mouse={x:0,y:0};addEventListener('pointermove',e=>{mouse.x=(e.clientX/innerWidth-.5)*2;mouse.y=(e.clientY/innerHeight-.5)*2},{passive:true});let progress=0,launchGlow=0;
const smooth=(a,b,t)=>a+(b-a)*THREE.MathUtils.clamp(t,0,1);const ease=t=>{t=THREE.MathUtils.clamp(t,0,1);return t*t*(3-2*t)};
function segment(p,a,b){return ease((p-a)/(b-a))}
function cameraPose(p){let x=6,y=3.1,z=10.5,tx=0,ty=0,tz=0,roll=0;
 if(p<.12){let t=segment(p,0,.12);x=smooth(6,3.8,t);y=smooth(3.1,2.1,t);z=smooth(10.5,8.2,t);roll=smooth(0,-.06,t)}
 else if(p<.24){let t=segment(p,.12,.24);x=smooth(3.8,-4,t);y=smooth(2.1,3,t);z=smooth(8.2,7,t);roll=smooth(-.06,.04,t)}
 else if(p<.43){let t=segment(p,.24,.43);x=smooth(-4,0,t);y=smooth(3,2,t);z=smooth(7,11,t)}
 else if(p<.54){let t=segment(p,.43,.54);x=smooth(0,.1,t);y=smooth(2,.5,t);z=smooth(11,2.35,t);tx=smooth(0,0,t);tz=smooth(0,.2,t)}
 else if(p<.66){let t=segment(p,.54,.66);x=smooth(.1,2.7,t);y=smooth(.5,1.1,t);z=smooth(2.35,4.25,t);tx=smooth(0,-.5,t);tz=smooth(.2,1.4,t)}
 else if(p<.75){let t=segment(p,.66,.75);x=smooth(2.7,0,t);y=smooth(1.1,.5,t);z=smooth(4.25,3.5,t);tz=smooth(1.4,0,t)}
 else if(p<.9){let t=segment(p,.75,.9);x=smooth(0,2.8,t);y=smooth(.5,2.1,t);z=smooth(3.5,10.7,t)}
 else {let t=segment(p,.9,1);x=smooth(2.8,0,t);y=smooth(2.1,1.3,t);z=smooth(10.7,14,t);tx=smooth(0,0,t);}
 const small=innerWidth<650?1.35:1;camera.position.set(x*small+mouse.x*.18,y*small-mouse.y*.12,z*small);camera.rotation.z=roll;camera.lookAt(tx,ty,tz);
}
function updateScene(p){progress=p;let ext=segment(p,.23,.43),ret=segment(p,.75,.9),explode=Math.max(0,ext-ret);const spread=explode*1.0;
 ship.rotation.y=.08*Math.sin(p*7);ship.rotation.x=.03*Math.sin(p*11);ship.rotation.z=0;
 for(const [name,g] of Object.entries(parts)){const h=g.userData.home;if(!h)continue;let dx=0,dy=0,dz=0;
  if(name==='hull'){dz=-.2*spread;dy=-.1*spread}
  if(name==='canopy'){dy=1.5*spread;dz=-.35*spread}
  if(name==='cockpit'){dy=.45*spread;dz=-.8*spread}
  if(name==='reactor'){dy=.4*spread;dz=1.55*spread;g.rotation.z=.28*spread}
  if(name==='reactor-cage'){dx=.55*spread;dy=.15*spread;dz=1.25*spread}
  if(name.startsWith('wing-')&&!name.includes('cannon')){let side=Math.sign(h.x)||1;dx=side*1.15*spread;dy=(name.includes('upper')?1:-1)*.58*spread;dz=(name.includes('upper')?-.9:.9)*spread;g.rotation.y=(name.includes('left')?-1:1)*.23*spread}
  if(name.includes('-cannon')){dx=(name.includes('left')?-1:1)*.2*spread;dy=.72*spread;dz=-.38*spread;g.rotation.x=.35*spread}
  if(name.startsWith('engine-')){dx=(h.x<0?-1:1)*1.05*spread;dy=(h.y>0?1:-1)*.68*spread;dz=1.7*spread;g.rotation.x=.18*spread;}
  if(name.includes('-turbine')){dz=.8*spread;g.rotation.z=p*2.4;}
  if(name.startsWith('brace')){dx=Math.sign(h.x)*.3*spread;dy=-.55*spread;}
  g.position.set(h.x+dx,h.y+dy,h.z+dz);
 }
 // Cockpit, reactor and engine close-ups take focus while the whole craft stays assembled in space.
 let inside=segment(p,.445,.5)*(1-segment(p,.515,.54));let eng=segment(p,.565,.615)*(1-segment(p,.63,.66));
 const reactorLight=THREE.MathUtils.lerp(2.2,4.7,inside);cyan.emissiveIntensity=reactorLight;glow.emissiveIntensity=2.2+segment(p,.91,.98)*5;
 for(let i=0;i<micro.children.length;i++){let m=micro.children[i],o=m.userData.origin,phase=m.userData.phase,amp=.22+explode*.85;m.position.set(o.x+Math.sin(p*5+phase)*amp,o.y+Math.cos(p*4+phase)*amp,o.z+Math.sin(p*3+phase)*amp);m.visible=explode>.1&&explode<.95}
 const launch=segment(p,.9,1);launchGlow=launch;ship.scale.setScalar(1-launch*.58);ship.position.z=-launch*15;ship.position.y=launch*.45;stars.rotation.y=p*.025;dust.position.z=(p-.5)*-4;
 cameraPose(p);document.querySelector('.progress-rail i').style.height=`${p*100}%`;
 document.querySelector('.topbar').classList.toggle('scrolled',scrollY>35);
 const phases=document.querySelectorAll('.phase-list span');let phaseIdx=p<.28?0:p<.33?1:p<.38?2:3;phases.forEach((el,i)=>el.classList.toggle('active',i===phaseIdx));
}
ScrollTrigger.create({trigger:'main',start:'top top',end:'bottom bottom',scrub:1.15,onUpdate:self=>updateScene(self.progress),invalidateOnRefresh:true});
// Orbital motion stays subtle at rest; scroll owns all major transforms.
let clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);let t=clock.getElapsedTime();ship.rotation.y+=.00045;for(let g of Object.values(parts)){if(g.name.includes('-turbine')&&progress<.5)g.rotation.z+=.003;}
 warm.intensity=4.6+Math.sin(t*2.4)*.6+launchGlow*9;rim.intensity=26+launchGlow*14;stars.rotation.x=Math.sin(t*.03)*.01;renderer.render(scene,camera)}
function resize(){camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<650?43:38;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<650?1.35:1.8));renderer.setSize(innerWidth,innerHeight);ScrollTrigger.refresh()}addEventListener('resize',resize);
let loaded=0;const loadingTimer=setInterval(()=>{loaded=Math.min(100,loaded+Math.ceil((100-loaded)*.14));loaderBar.style.width=loaded+'%';loaderNum.textContent=String(loaded).padStart(2,'0');if(loaded>=100){clearInterval(loadingTimer);setTimeout(()=>loader.classList.add('done'),350)}},45);
animate();updateScene(0);

// Mobile navigation and replay return the complete scrollytelling sequence to its opening frame.
const menu=document.querySelector('.mobile-menu');document.querySelector('.menu-button').addEventListener('click',()=>menu.classList.add('open'));document.querySelector('.menu-close').addEventListener('click',()=>menu.classList.remove('open'));menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.classList.remove('open')));document.querySelector('.replay').addEventListener('click',()=>{menu.classList.remove('open');window.scrollTo({top:0,behavior:'smooth'})});
// A gentle user-initiated oscillator ambience; browsers never start audio before the toggle is used.
let audioCtx=null,osc=null,gain=null,audioOn=false;const soundBtn=document.querySelector('#soundToggle');soundBtn.addEventListener('click',async()=>{if(!audioCtx){audioCtx=new (window.AudioContext||window.webkitAudioContext)();osc=audioCtx.createOscillator();let filter=audioCtx.createBiquadFilter();gain=audioCtx.createGain();osc.type='sine';osc.frequency.value=48;filter.type='lowpass';filter.frequency.value=95;gain.gain.value=0;osc.connect(filter).connect(gain).connect(audioCtx.destination);osc.start()}await audioCtx.resume();audioOn=!audioOn;gain.gain.setTargetAtTime(audioOn?.028:0,audioCtx.currentTime,.35);soundBtn.querySelector('b').textContent=audioOn?'ON':'OFF';soundBtn.setAttribute('aria-label',audioOn?'Turn sound off':'Turn sound on')});

}
