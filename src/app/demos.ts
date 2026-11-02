import { Component, computed, signal } from '@angular/core';

/* ═════════ 3 · RESTAURANT MANAGEMENT — Laravel/Blade : or #C8A96E sur noir, Cormorant Garamond + Jost ═════════ */
interface Dish { id: number; name: string; cat: string; price: number; e: string; d: string; }
interface Res { name: string; n: number; date: string; hour: string; table: number; ok: boolean; }
@Component({ selector: 'demo-resto', template: `
<div class="d-rs">
 <nav class="tp"><b>L’Art de Bien Manger</b><span>
  <a [class.on]="scr() === 'home'" (click)="scr.set('home')">Accueil</a><a [class.on]="scr() === 'menu'" (click)="scr.set('menu')">Carte</a>
  <a (click)="open.set(true)">Réserver</a><a [class.on]="scr() === 'admin'" (click)="scr.set('admin')">Admin</a>
  <a class="cart" (click)="scr.set('menu')">Panier {{ count() }}</a></span></nav>
 @if (toast()) { <div class="toast">{{ toast() }}</div> }
 @switch (scr()) {
  @case ('home') {
   <section class="hero"><span class="bd">Casablanca · Depuis 2010</span><h1>L’Art de<br><em>Bien Manger</em></h1>
    <p class="sb">— Une expérience gastronomique d’exception —</p>
    <div class="bt"><button class="gold" (click)="open.set(true)">Réserver une table</button><button class="line" (click)="scr.set('menu')">Voir la carte</button></div>
    <div class="st"><div><b>★ 4.9</b>Note Google</div><div><b>48</b>Tables</div><div><b>14</b>Années</div></div></section>
   <div class="strip"><span>📍 15 Avenue des Arts, Casablanca</span><span>🕒 Mar–Sam · 12h–15h · 19h–23h</span></div>
  }
  @case ('menu') {
   <div class="fb"><div>@for (c of cats; track c[0]) { <button [class.on]="cat() === c[0]" (click)="cat.set(c[0])">{{ c[1] }}</button> }</div>
    <input #s placeholder="Rechercher un plat…" (input)="q.set(s.value)">
    <select #o (change)="sort.set(o.value)"><option value="d">Ordre par défaut</option><option value="a">Prix croissant</option><option value="z">Prix décroissant</option></select></div>
   <div class="mn"><div class="cnt">{{ shown().length }} plats affichés · cliquez sur un plat pour l’ajouter au panier</div>
    <div class="mg"><div class="dg">@for (x of shown(); track x.id) { <div class="dish" (click)="addc(x.id, 1)"><i>{{ x.e }}</i><h3>{{ x.name }}</h3><p>{{ x.d }}</p><b>{{ x.price }} MAD</b></div> }</div>
    <aside class="bk"><h4>Votre panier</h4>
     @for (l of lines(); track l.x.id) { <div class="cl"><span>{{ l.x.name }}</span><span><button (click)="addc(l.x.id, -1)">−</button> {{ l.n }} <button (click)="addc(l.x.id, 1)">+</button></span></div> } @empty { <p class="mu">Panier vide</p> }
     <div class="tt">Total <b>{{ total() }} MAD</b></div><button class="gold full" [disabled]="!count()" (click)="order()">Commander</button></aside></div></div>
  }
  @case ('admin') {
   <div class="ad"><aside><div class="lg"><i>LM</i>Snack Yassine</div>
     <a class="on">⊞ Tableau de bord</a><a>🗓 Réservations <em>{{ resOk() }}</em></a><a>🍽 Commandes <em>{{ orders() }}</em></a><a>＋ Items</a><a>👥 Utilisateurs</a></aside>
    <div class="ct"><div class="sc">
      <div><small>Réservations</small><b>{{ resOk() }}</b><u>▲ 12% vs hier</u></div><div><small>Revenus</small><b class="g">{{ revenue() }} MAD</b><u>▲ 8%</u></div>
      <div><small>Tables occupées</small><b>{{ 15 + orders() }}<span>/48</span></b><u class="bl">● {{ ((15 + orders()) / 48 * 100).toFixed(1) }}% taux</u></div><div><small>Satisfaction</small><b class="gr">4.9</b><u>▲ 0.1 ce mois</u></div></div>
     <div class="cc"><small>Revenus — 7 derniers jours</small><div class="bars">@for (h of bars(); track $index) { <span [style.height.%]="h"></span> }</div></div>
     <div class="cc"><small>Réservations</small>
      @for (r of res(); track $index) { <div class="rr"><span>{{ r.name }} · {{ r.n }} pers.</span><span>{{ r.date }} {{ r.hour }} · T{{ r.table }}</span>
        <button [class.cx]="!r.ok" (click)="flip($index)">{{ r.ok ? 'confirmed' : 'cancelled' }}</button></div> }</div></div></div>
  }
 }
 @if (open()) { <div class="mdl" (click)="open.set(false)"><div class="bx" (click)="$event.stopPropagation()"><h3>Réserver une table</h3>
   <input #nm placeholder="Nom"><div class="two"><input #np type="number" value="2" min="1" placeholder="Personnes"><input #nt type="number" value="7" min="1" max="48" placeholder="Table"></div>
   <div class="two"><input #dt type="date" value="2026-11-08"><input #hr type="time" value="20:00"></div>
   <button class="gold full" (click)="book(nm.value, +np.value, dt.value, hr.value, +nt.value)">Confirmer la réservation</button></div></div> }
</div>` })
export class RestoDemo {
  cats = [['all', 'Tous'], ['entrees', '🥗 Entrées'], ['plats', '🍖 Plats'], ['desserts', '🍮 Desserts'], ['boissons', '🍷 Boissons']];
  menu: Dish[] = [
    { id: 1, name: 'Salade marocaine', cat: 'entrees', price: 45, e: '🥗', d: 'Tomates, concombre, coriandre, huile d’olive.' },
    { id: 2, name: 'Pastilla au poulet', cat: 'entrees', price: 85, e: '🥧', d: 'Feuilleté croustillant, amandes et cannelle.' },
    { id: 3, name: 'Tajine d’agneau', cat: 'plats', price: 160, e: '🍖', d: 'Pruneaux, amandes grillées, mijoté 4 heures.' },
    { id: 4, name: 'Couscous royal', cat: 'plats', price: 140, e: '🍲', d: 'Semoule fine, légumes, merguez et agneau.' },
    { id: 5, name: 'Filet de bœuf', cat: 'plats', price: 210, e: '🥩', d: 'Sauce au poivre, gratin dauphinois.' },
    { id: 6, name: 'Crème brûlée', cat: 'desserts', price: 55, e: '🍮', d: 'Vanille de Madagascar, caramel craquant.' },
    { id: 7, name: 'Cornes de gazelle', cat: 'desserts', price: 40, e: '🌙', d: 'Pâte d’amande, fleur d’oranger.' },
    { id: 8, name: 'Thé à la menthe', cat: 'boissons', price: 20, e: '🍵', d: 'Menthe fraîche de la médina.' },
    { id: 9, name: 'Jus d’orange pressé', cat: 'boissons', price: 25, e: '🍊', d: 'Oranges de Berkane pressées minute.' }];
  scr = signal<'home' | 'menu' | 'admin'>('home'); cat = signal('all'); q = signal(''); sort = signal('d'); open = signal(false); toast = signal('');
  cart = signal<Record<number, number>>({}); orders = signal(3); sales = signal(0);
  res = signal<Res[]>([{ name: 'Benali', n: 4, date: '2026-11-03', hour: '20:00', table: 12, ok: true }, { name: 'El Fassi', n: 2, date: '2026-11-03', hour: '21:00', table: 5, ok: true }]);
  shown = computed(() => {
    const a = this.menu.filter(x => (this.cat() === 'all' || x.cat === this.cat()) && x.name.toLowerCase().includes(this.q().toLowerCase()));
    return this.sort() === 'a' ? [...a].sort((x, y) => x.price - y.price) : this.sort() === 'z' ? [...a].sort((x, y) => y.price - x.price) : a;
  });
  lines = computed(() => this.menu.filter(x => this.cart()[x.id]).map(x => ({ x, n: this.cart()[x.id] })));
  count = computed(() => this.lines().reduce((s, l) => s + l.n, 0));
  total = computed(() => this.lines().reduce((s, l) => s + l.n * l.x.price, 0));
  resOk = computed(() => this.res().filter(r => r.ok).length);
  revenue = computed(() => (4820 + this.sales()).toLocaleString('fr-FR'));
  bars = computed(() => [58, 46, 72, 55, 88, 100, Math.min(100, 40 + this.sales() / 20)]);
  addc(id: number, d: number) { this.cart.update(c => { const n = Math.max(0, (c[id] ?? 0) + d); const o = { ...c, [id]: n }; if (!n) delete o[id]; return o; }); }
  flash(m: string) { this.toast.set(m); setTimeout(() => this.toast.set(''), 2400); }
  order() { this.orders.update(n => n + 1); this.sales.update(s => s + this.total()); this.cart.set({}); this.flash('Commande envoyée en cuisine ✔'); }
  book(name: string, n: number, date: string, hour: string, table: number) {
    this.res.update(a => [{ name: name || 'Client', n, date, hour, table, ok: true }, ...a]); this.open.set(false); this.flash('Réservation confirmée ✔');
  }
  flip(i: number) { this.res.update(a => a.map((r, j) => j === i ? { ...r, ok: !r.ok } : r)); }
}
