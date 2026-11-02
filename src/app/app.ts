import { Component, Directive, ElementRef, HostListener, Input, NgZone, inject, signal } from '@angular/core';
import { Bg3d } from './hero3d';
import { Cursor, Shots, SkillSphere } from './widgets';
import { RestoDemo } from './demos';

@Directive({ selector: '[tilt]' })
export class Tilt {
  private el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  @Input('tilt') amp: number | string = 14;
  @HostListener('mousemove', ['$event']) m(e: MouseEvent) {
    const r = this.el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5, a = +this.amp || 14;
    this.el.style.transform = `perspective(900px) rotateY(${x * a}deg) rotateX(${-y * a}deg) translateZ(8px)`;
  }
  @HostListener('mouseleave') l() { this.el.style.transform = ''; }
}
@Directive({ selector: '[magnet]' })
export class Magnet {
  private el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  @HostListener('mousemove', ['$event']) m(e: MouseEvent) { const r = this.el.getBoundingClientRect(); this.el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px,${(e.clientY - r.top - r.height / 2) * 0.4}px)`; }
  @HostListener('mouseleave') l() { this.el.style.transform = ''; }
}
@Directive({ selector: '[reveal]' })
export class Reveal {
  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement; el.classList.add('rv');
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('in'); io.disconnect(); } }, { threshold: 0.12 }); io.observe(el);
  }
}
@Directive({ selector: '[scramble]' })
export class Scramble {
  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, ch = '!<>-_/[]{}=+*^?#01';
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect(); const fin = el.textContent || ''; let f = 0;
      const id = setInterval(() => { el.textContent = fin.split('').map((c, i) => c === ' ' || i < f / 2 ? c : ch[(Math.random() * ch.length) | 0]).join(''); if (++f > fin.length * 2) { el.textContent = fin; clearInterval(id); } }, 28);
    }); io.observe(el);
  }
}
@Directive({ selector: '[count]' })
export class Count {
  @Input('count') to = 0;
  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect(); const t0 = performance.now();
      const st = (t: number) => { const k = Math.min(1, (t - t0) / 1400); el.textContent = String(Math.round(this.to * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(st); }; requestAnimationFrame(st);
    }); io.observe(el);
  }
}
@Directive({ selector: '[scrollFill]' })
export class ScrollFill {
  private el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  @HostListener('window:scroll') s() { const r = this.el.getBoundingClientRect(); this.el.style.setProperty('--p', String(Math.max(0, Math.min(1, (innerHeight * 0.65 - r.top) / r.height)))); }
}

@Component({
  selector: 'app-root', imports: [Bg3d, Cursor, Shots, SkillSphere, RestoDemo, Tilt, Magnet, Reveal, Scramble, Count, ScrollFill],
  template: `
<app-cursor /><bg-3d />
<div class="prog" [style.width.%]="prog()"></div>
<div class="loader" [class.done]="ready()"><div class="ld"><b>ML<span>.</span></b><i><u [style.width.%]="pct()"></u></i><small>{{ pct() }}%</small></div></div>

<header class="nav"><a href="#top" class="logo">ML<span>.</span></a>
  <nav><a href="#about">À propos</a><a href="#skills">Skills</a><a href="#projects">Projets</a><a href="#journey">Parcours</a><a href="#contact" class="cta" magnet>Contact</a></nav></header>

<main id="top" [class.go]="ready()">
<section class="hero">
  <div class="htxt"><p class="tag"><i></i> Disponible · stage & alternance</p>
    <h1 class="mega"><span class="ln"><span>El Makhtar</span></span><span class="ln"><span class="grad">Laarif</span></span></h1>
    <p class="role">&gt; {{ typed() }}<b class="caret"></b></p>
    <p class="sub">Je conçois des applications web performantes — de l’API Java à l’interface Angular.</p>
    <div class="btns"><a class="btn" href="#projects" magnet>Voir mes projets</a><a class="btn ghost" href="https://github.com/ELMAKHTARLAARIF" target="_blank" magnet>GitHub ↗</a></div></div>
  <div class="scrollhint"><span>scroll</span><i></i></div>
</section>

<div class="marq"><div>@for (k of [1, 2]; track k) { <span>JAVA ✦ ANGULAR ✦ SPRING BOOT ✦ LARAVEL ✦ .NET ✦ POSTGRESQL ✦ DOCKER ✦ TAILWIND ✦ </span> }</div></div>

<section id="about" class="sec two">
  <div reveal><h2 class="sech"><span scramble>À propos</span></h2>
    <p class="lead">Développeur Full Stack formé à <b>YouCode (UM6P)</b>, passionné par les technologies web et la création de solutions numériques performantes. Motivé, rigoureux et orienté résultats, je mets mes compétences au service de projets innovants.</p>
    <div class="stats"><div tilt><b [count]="3">0</b>projets</div><div tilt><b [count]="24">0</b>repos GitHub</div><div tilt><b [count]="10">0</b>technos</div><div tilt><b [count]="1">0</b>stage PFA</div></div></div>
  <div class="code glass" reveal tilt><div class="dots"><i></i><i></i><i></i><span>profile.ts</span></div><pre [innerHTML]="code"></pre></div>
</section>

<section id="skills" class="sec two rev">
  <div reveal><skill-sphere /></div>
  <div reveal><h2 class="sech"><span scramble>Compétences</span></h2><p class="mut">Passe la souris sur la sphère ↖ pour la faire tourner.</p>
    @for (g of skills; track g.t) { <div class="sg"><h3>{{ g.t }}</h3><div class="pills">@for (s of g.l; track s) { <span tilt>{{ s }}</span> }</div></div> }</div>
</section>

<section id="projects" class="sec wide"><h2 class="sech" reveal><span scramble>Projets</span><small>03</small></h2>
  <article class="chap" reveal>
    <div class="ch"><span class="num">01</span><div><h3>Restaurant Management</h3><span class="badge live">● Démo live</span>
      <p>Site de restaurant haut de gamme : carte filtrable, panier et commandes, réservation de table en ligne, paiement Stripe et tableau de bord admin avec statistiques.</p>
      <div class="pills"><span>Laravel</span><span>PHP</span><span>Blade</span><span>Tailwind CSS</span><span>MySQL</span><span>Stripe</span></div>
      <a class="lnk" href="https://github.com/ELMAKHTARLAARIF/Gestion_restaurant" target="_blank" magnet>Voir le code ↗</a></div></div>
    <div class="stage" [tilt]="2"><div class="frame"><div class="bar"><i></i><i></i><i></i><span>restaurant.test/menu — essaie-le !</span></div><demo-resto /></div></div>
  </article>

  <article class="chap" reveal>
    <div class="ch"><span class="num">02</span><div><h3>Virtual Workspace</h3><span class="badge">▣ Captures</span>
      <p>Application web interactive de gestion du personnel : plan d’étage, affectation des collaborateurs aux salles selon leur rôle, profils avec expériences, validation des champs et sauvegarde dans le localStorage.</p>
      <div class="pills"><span>HTML</span><span>CSS</span><span>JavaScript ES6</span><span>localStorage</span></div>
      <a class="lnk" href="https://github.com/ELMAKHTARLAARIF/Virtual_Workspace" target="_blank" magnet>Voir le code ↗</a></div></div>
    <shots [list]="ws" />
  </article>

  <article class="chap" reveal>
    <div class="ch"><span class="num">03</span><div><h3>Clinic Manager</h3><span class="badge">▣ Captures</span>
      <p>Application Java EE de gestion de clinique avec trois espaces (admin, médecin, patient) : dashboard, médecins, patients, spécialités, départements, disponibilités et prise de rendez-vous.</p>
      <div class="pills"><span>Java</span><span>JSP · JSTL</span><span>Servlets</span><span>Hibernate</span><span>PostgreSQL</span><span>Maven</span></div>
      <a class="lnk" href="https://github.com/ELMAKHTARLAARIF/clinic-manager" target="_blank" magnet>Voir le code ↗</a></div></div>
    <shots [list]="cl" />
  </article>
</section>

<section id="journey" class="sec"><h2 class="sech" reveal><span scramble>Parcours</span></h2>
  <div class="tl" scrollFill>@for (e of timeline; track e.t) { <div class="ti" reveal><i></i><div class="glass" tilt><small>{{ e.d }}</small><h3>{{ e.t }}</h3><p>{{ e.s }}</p></div></div> }</div></section>

<section id="contact" class="sec center">
  <p class="mut" reveal>Un projet, un stage, une idée ?</p>
  <h2 class="giant" reveal>Parlons-en<span class="grad">.</span></h2>
  <div class="btns" reveal><button class="btn" magnet (click)="copy()">{{ copied() ? 'Copié ✔' : 'mokhtarlaarif54@gmail.com' }}</button>
    <a class="btn ghost" magnet href="https://linkedin.com/in/laarif-el-makhtar" target="_blank">LinkedIn ↗</a><a class="btn ghost" magnet href="tel:+212670983477">+212 670 983 477</a></div>
  <footer>© 2026 El Makhtar Laarif · Youssoufia, Maroc · Fait avec Angular & Three.js</footer></section>
</main>`,
})
export class App {
  zone = inject(NgZone);
  pct = signal(0); ready = signal(false); prog = signal(0); copied = signal(false); typed = signal('');
  roles = ['Développeur Full Stack', 'Java · Spring Boot · Angular', 'Laravel · PHP · Tailwind', '.NET · SaaS'];
  skills = [
    { t: 'Front-End', l: ['HTML', 'CSS', 'Tailwind CSS', 'JavaScript', 'React JS', 'Angular'] }, { t: 'Back-End', l: ['Java', 'JEE', 'Spring Boot', 'PHP', 'Laravel', '.NET'] },
    { t: 'Bases de données', l: ['SQL Server', 'MySQL', 'PostgreSQL'] }, { t: 'Outils', l: ['Git', 'GitHub', 'Docker', 'Jira', 'Figma'] },
    { t: 'Concepts & méthodes', l: ['POO', 'MVC', 'MVVM', 'Agile', 'Scrum'] }];
  code = `<i class="k">const</i> <i class="v">elMakhtar</i> = &#123;
  <i class="p">role</i>: <i class="s">'Full Stack Developer'</i>,
  <i class="p">school</i>: <i class="s">'YouCode · UM6P'</i>,
  <i class="p">stack</i>: [<i class="s">'Java'</i>, <i class="s">'Angular'</i>, <i class="s">'Laravel'</i>, <i class="s">'.NET'</i>],
  <i class="p">based</i>: <i class="s">'Youssoufia, Maroc 🇲🇦'</i>,
  <i class="p">languages</i>: [<i class="s">'Amazigh'</i>, <i class="s">'Arabe'</i>, <i class="s">'Français'</i>, <i class="s">'English'</i>],
  <i class="p">openToWork</i>: <i class="k">true</i>,
  <i class="p">coffee</i>: <i class="k">Infinity</i>,
&#125;;`;
  ws = [{ src: 'projects/ws-1.jpg', cap: 'Plan d’étage & membres non affectés' }, { src: 'projects/ws-2.jpg', cap: 'Affectation à une salle selon le rôle' }, { src: 'projects/ws-3.jpg', cap: 'Détails du profil et expériences' }, { src: 'projects/ws-4.jpg', cap: 'Ajout d’un nouveau collaborateur' }];
  cl = [{ src: 'projects/cl-2.jpg', cap: 'Dashboard administrateur' }, { src: 'projects/cl-1.jpg', cap: 'Connexion' }, { src: 'projects/cl-3.jpg', cap: 'Gestion des médecins' }, { src: 'projects/cl-4.jpg', cap: 'Espace médecin' }];
  timeline = [
    { d: '05/2026 – 07/2026 · Rabat', t: 'Stage PFA — Ibn Maroc Holding', s: 'Développeur Full Stack .NET sur NIDAM, plateforme SaaS centralisée, sécurisée et évolutive pour la gestion des dossiers clients.' },
    { d: '2025 – en cours · Youssoufia', t: 'YouCode — UM6P', s: 'Formation Développeur Full Stack.' },
    { d: '2024 – 2025 · Agadir', t: 'Faculté Ibn Zohr', s: '1ʳᵉ année en Électronique et Systèmes.' },
    { d: '2023 – 2024 · El Guerdane', t: 'Lycée Al Irfane', s: 'Baccalauréat Sciences Physiques.' }];
  constructor() {
    const id = setInterval(() => { this.pct.update(p => Math.min(100, p + 4 + ((Math.random() * 6) | 0))); if (this.pct() >= 100) { clearInterval(id); setTimeout(() => this.ready.set(true), 250); } }, 60);
    this.zone.runOutsideAngular(() => addEventListener('scroll', () => { const p = (scrollY / Math.max(1, document.body.scrollHeight - innerHeight)) * 100; this.zone.run(() => this.prog.set(p)); }, { passive: true }));
    let ri = 0, ci = 0, del = false;
    setInterval(() => { const w = this.roles[ri]; ci += del ? -1 : 1; this.typed.set(w.slice(0, ci)); if (!del && ci === w.length) { del = true; ci += 12; } else if (del && ci <= 0) { del = false; ri = (ri + 1) % this.roles.length; } }, 70);
  }
  copy() { navigator.clipboard?.writeText('mokhtarlaarif54@gmail.com'); this.copied.set(true); setTimeout(() => this.copied.set(false), 1800); }
}
