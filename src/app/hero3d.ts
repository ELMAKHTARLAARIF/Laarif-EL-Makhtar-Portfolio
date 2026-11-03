import { Component, ElementRef, NgZone, OnDestroy, afterNextRender, inject, viewChild } from '@angular/core';
import * as THREE from 'three';

const VERT = `uniform float t; uniform vec2 m; varying vec3 vN; varying float vD;
float h(vec3 p){return sin(p.x*2.+t)*sin(p.y*2.3+t*1.1)*sin(p.z*2.1+t*.9);}
void main(){ vN=normalize(normalMatrix*normal); float d=h(position*1.25)*.34+sin(position.y*3.+t*1.5+m.x*3.)*.07+m.y*.1; vD=d;
 gl_Position=projectionMatrix*modelViewMatrix*vec4(position+normal*d,1.); }`;
const FRAG = (wire: boolean) => `varying vec3 vN; varying float vD; void main(){ float f=pow(1.-abs(vN.z),2.);
 vec3 c=mix(vec3(.49,.36,1.),vec3(.18,.89,.7),clamp(vD*2.+.5,0.,1.)); gl_FragColor=vec4(${wire ? 'c*1.3,.28' : 'c*(.25+f*1.5),.92'}); }`;

/** Fixed 3D background: shader-displaced orb + wireframe shell + orbiting rings + particles. Reacts to mouse & scroll. */
@Component({ selector: 'bg-3d', template: '<canvas #c></canvas>' })
export class Bg3d implements OnDestroy {
  private zone = inject(NgZone);
  private cv = viewChild.required<ElementRef<HTMLCanvasElement>>('c');
  private stop = () => {};
  constructor() { afterNextRender(() => this.zone.runOutsideAngular(() => this.init())); }
  private init() {
    const canvas = this.cv().nativeElement;
    let r: THREE.WebGLRenderer;
    try { r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch { return; }
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(55, 1, 0.1, 100); cam.position.z = 8;
    const uni = { t: { value: 0 }, m: { value: new THREE.Vector2() } };
    const mk = (wire: boolean) => new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, wire ? 5 : 40),
      new THREE.ShaderMaterial({ uniforms: uni, vertexShader: VERT, fragmentShader: FRAG(wire), transparent: true, wireframe: wire }));
    const orb = new THREE.Group(); orb.add(mk(false), mk(true));
    const rings: THREE.Mesh[] = [], dots: THREE.Mesh[] = [];
    [2.6, 3.2, 3.8].forEach((rad, i) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.008, 8, 200), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x2de2b3 : 0x7c5cff, transparent: true, opacity: 0.5 }));
      ring.rotation.set(Math.PI / 2 + i * 0.5, i * 0.7, 0); const dot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      orb.add(ring, dot); rings.push(ring); dots.push(dot);
    });
    const n = 1200, pos = new Float32Array(n * 3); for (let i = 0; i < n * 3; i++) pos[i] = (Math.random() - 0.5) * 36;
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.03, transparent: true, opacity: 0.6 }));
    scene.add(orb, pts);
    let mx = 0, my = 0, sy = 0, tx = 0, ty = 0; const clock = new THREE.Clock();
    const mv = (e: MouseEvent) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; };
    const sc = () => (sy = scrollY / innerHeight);
    const rs = () => { r.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); };
    addEventListener('mousemove', mv); addEventListener('scroll', sc); addEventListener('resize', rs); rs();
    let raf = 0;
    const loop = () => {
      const t = clock.getElapsedTime(); uni.t.value = t; tx += (mx - tx) * 0.05; ty += (my - ty) * 0.05; uni.m.value.set(tx, ty);
      const wide = innerWidth > 900, k = Math.min(sy, 3);
      orb.position.set((wide ? 2.9 : 0) - k * 1.6 * (wide ? 1 : 0), (wide ? 0 : 1.6) + k * 1.2, -k * 2.2);
      orb.rotation.y = t * 0.12 + tx * 1.2 + k; orb.rotation.x = ty * 0.8 + k * 0.5;
      rings.forEach((g, i) => { g.rotation.z = t * (0.15 + i * 0.07); dots[i].position.set(Math.cos(t * (0.6 + i * 0.25) + i) * (2.6 + i * 0.6), 0, Math.sin(t * (0.6 + i * 0.25) + i) * (2.6 + i * 0.6)); dots[i].position.applyEuler(g.rotation); });
      pts.rotation.y = t * 0.01 + sy * 0.6 + tx * 0.2; pts.rotation.x = ty * 0.15;
      canvas.style.opacity = String(Math.max(0.22, 1 - sy * 0.65));
      r.render(scene, cam); raf = requestAnimationFrame(loop);
    };
    loop();
    this.stop = () => { cancelAnimationFrame(raf); removeEventListener('mousemove', mv); removeEventListener('scroll', sc); removeEventListener('resize', rs); r.dispose(); };
  }
  ngOnDestroy() { this.stop(); }
}
