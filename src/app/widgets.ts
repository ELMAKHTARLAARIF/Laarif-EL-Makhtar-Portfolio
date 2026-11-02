import { Component, ElementRef, HostListener, NgZone, OnDestroy, afterNextRender, inject, input, signal, viewChild } from '@angular/core';

/** Custom cursor: dot + trailing ring that grows over interactive elements. */
@Component({ selector: 'app-cursor', template: '<div class="cur dot" #d></div><div class="cur ring" #r></div>' })
export class Cursor {
  d = viewChild.required<ElementRef<HTMLElement>>('d'); r = viewChild.required<ElementRef<HTMLElement>>('r');
  constructor() {
    const zone = inject(NgZone);
    afterNextRender(() => { if (!matchMedia('(pointer:fine)').matches) return; document.body.classList.add('nocur');
      zone.runOutsideAngular(() => { let x = 0, y = 0, rx = 0, ry = 0;
        addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; this.d().nativeElement.style.transform = `translate(${x}px,${y}px)`;
          this.r().nativeElement.classList.toggle('big', !!(e.target as HTMLElement).closest('a,button,[tilt],.shot,input,select,.dish')); });
        const f = () => { rx += (x - rx) * 0.16; ry += (y - ry) * 0.16; this.r().nativeElement.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(f); }; f(); });
    });
  }
}

/** Interactive 3D tag sphere: words on a Fibonacci sphere, driven by the mouse. */
@Component({ selector: 'skill-sphere', template: '<canvas #c></canvas>', styles: ':host{display:block;width:100%;aspect-ratio:1;max-width:520px}canvas{width:100%;height:100%}' })
export class SkillSphere implements OnDestroy {
  c = viewChild.required<ElementRef<HTMLCanvasElement>>('c'); private raf = 0;
  words = ['Java', 'Angular', 'Spring Boot', 'Laravel', '.NET', 'PHP', 'JavaScript', 'React', 'Tailwind', 'HTML', 'CSS', 'MySQL', 'PostgreSQL', 'SQL Server', 'Docker', 'Git', 'GitHub', 'Jira', 'Figma', 'JEE', 'MVC', 'Scrum', 'Agile', 'POO', 'MVVM'];
  constructor() {
    const zone = inject(NgZone);
    afterNextRender(() => zone.runOutsideAngular(() => {
      const cv = this.c().nativeElement, g = cv.getContext('2d')!, N = this.words.length; let S = 500, ax = 0.004, ay = 0.006, a = 0, b = 0, over = false;
      const P = this.words.map((w, i) => { const y = 1 - (i / (N - 1)) * 2, rad = Math.sqrt(1 - y * y), th = i * 2.399963; return { w, x: Math.cos(th) * rad, y, z: Math.sin(th) * rad }; });
      const rs = () => { const d = devicePixelRatio; S = cv.clientWidth; cv.width = cv.height = S * d; g.setTransform(d, 0, 0, d, 0, 0); }; rs(); addEventListener('resize', rs);
      cv.addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(); ay = ((e.clientX - r.left) / r.width - 0.5) * 0.04; ax = -((e.clientY - r.top) / r.height - 0.5) * 0.04; over = true; });
      cv.addEventListener('mouseleave', () => { over = false; ax = 0.004; ay = 0.006; });
      const loop = () => { g.clearRect(0, 0, S, S); a += ax; b += ay; const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
        P.map(p => { const y1 = p.y * ca - p.z * sa, z1 = p.y * sa + p.z * ca, x2 = p.x * cb + z1 * sb, z2 = -p.x * sb + z1 * cb; return { w: p.w, x: x2, y: y1, z: z2 }; })
          .sort((p, q) => p.z - q.z).forEach(p => { const s = (p.z + 1.6) / 2.6; g.globalAlpha = Math.max(0.15, s); g.font = `${Math.round(11 + s * 12)}px 'Space Grotesk'`; g.textAlign = 'center';
            g.fillStyle = p.z > 0.2 ? '#2de2b3' : '#a99bff'; g.fillText(p.w, S / 2 + p.x * S * 0.38, S / 2 + p.y * S * 0.38); });
        g.globalAlpha = over ? 0.5 : 0.2; this.raf = requestAnimationFrame(loop); };
      loop();
    }));
  }
  ngOnDestroy() { cancelAnimationFrame(this.raf); }
}

/** Screenshot gallery inside a tilted laptop frame, with thumbnails and a lightbox. */
@Component({ selector: 'shots', template: `
<div class="dev"><div class="lap"><div class="bar"><i></i><i></i><i></i><span>{{ list()[i()].cap }}</span></div>
  <img class="shot" [src]="list()[i()].src" [alt]="list()[i()].cap" (click)="zoom.set(true)">
  <button class="nv l" (click)="go(-1)" aria-label="Précédent">‹</button><button class="nv r" (click)="go(1)" aria-label="Suivant">›</button></div><div class="base"></div></div>
<div class="thumbs">@for (s of list(); track s.src; let k = $index) { <button [class.on]="k === i()" (click)="i.set(k)"><img [src]="s.src" alt=""></button> }</div>
@if (zoom()) { <div class="lb" (click)="zoom.set(false)"><img [src]="list()[i()].src" alt=""><p>{{ list()[i()].cap }} · ← → pour naviguer · Échap pour fermer</p></div> }` })
export class Shots {
  list = input.required<{ src: string; cap: string }[]>(); i = signal(0); zoom = signal(false);
  go(d: number) { this.i.update(v => (v + d + this.list().length) % this.list().length); }
  @HostListener('document:keydown', ['$event']) k(e: KeyboardEvent) { if (!this.zoom()) return; if (e.key === 'Escape') this.zoom.set(false); if (e.key === 'ArrowRight') this.go(1); if (e.key === 'ArrowLeft') this.go(-1); }
}
