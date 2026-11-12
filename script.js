const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = matchMedia('(hover:hover)').matches;

/* ---------- scroll: header state, progress bar, parallax ---------- */
const bar = $('.progress'), pars = $$('[data-par]');
let ticking = false;
function onScroll() {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  document.body.classList.toggle('scrolled', y > 40);
  if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  if (!reduce) pars.forEach(i => { i.style.transform = `translateY(${Math.min(y, 800) * .08}px)` });
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll) } }, { passive: true });
onScroll();

/* ---------- mobile nav ---------- */
$('#burger')?.addEventListener('click', () => $('#nav').classList.toggle('open'));
$$('#nav a').forEach(a => a.addEventListener('click', () => $('#nav').classList.remove('open')));

/* ---------- demo session UI (works with login.js) ---------- */
const sessionKey = 'stacklyfit-session';
const getSession = () => { try { return JSON.parse(localStorage.getItem(sessionKey) || sessionStorage.getItem(sessionKey) || 'null') } catch { return null } };
const user = getSession();
if (user) {
  const a = $('.acts .login'), j = $('.acts .join');
  if (a) { a.textContent = `Hi, ${user.firstName}`; a.href = 'index.html' }
  if (j) {
    j.firstChild.textContent = 'Log out ';
    j.href = '#';
    j.addEventListener('click', e => { e.preventDefault(); try { localStorage.removeItem(sessionKey); sessionStorage.removeItem(sessionKey) } catch { } location.href = 'index.html' });
  }
}

/* ---------- reveal on scroll (staggered via --d) ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in'); io.unobserve(e.target);
  setTimeout(() => e.target.classList.add('done'), 1300);
}), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
$$('.rv').forEach(el => io.observe(el));

/* ---------- counters ---------- */
const countUp = (el, t, dur = 1800, delay = 0) => {
  if (reduce) { el.textContent = t.toLocaleString(); return }
  setTimeout(() => {
    const s = performance.now();
    (function f(n) { const p = Math.min((n - s) / dur, 1); el.textContent = Math.round(t * (1 - Math.pow(1 - p, 4))).toLocaleString(); p < 1 && requestAnimationFrame(f) })(s)
  }, delay)
};
$$('[data-count]').forEach(el => countUp(el, +el.dataset.count, 1800, 2300));
const co = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; co.unobserve(e.target); countUp(e.target, +e.target.dataset.scount, 1600)
}), { threshold: .6 });
$$('[data-scount]').forEach(el => co.observe(el));

/* ---------- magnetic buttons + 3D tilt ---------- */
if (!reduce && canHover) {
  $$('.magnet').forEach(b => {
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .32}px)` });
    b.addEventListener('mouseleave', () => b.style.transform = '')
  });
  $$('.coach').forEach(c => {
    c.addEventListener('mousemove', e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)` });
    c.addEventListener('mouseleave', () => c.style.transform = '')
  });
  // hero orbs drift with the mouse
  const hc = $('.hero-card');
  if (hc) hc.addEventListener('mousemove', e => {
    const r = hc.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    $$('.orb', hc).forEach((o, i) => { o.style.translate = `${-x * (30 + i * 20)}px ${-y * (30 + i * 20)}px` })
  });
}

/* ---------- home: programs accordion + image panel ---------- */
const rows = $$('.prow'), panels = $$('.pp');
const pick = i => { rows.forEach((r, k) => { r.classList.toggle('on', k === i); r.setAttribute('aria-expanded', k === i) }); panels.forEach((p, k) => p.classList.toggle('on', k === i)) };
rows.forEach((r, i) => { r.addEventListener('click', () => pick(i)); if (canHover) r.addEventListener('mouseenter', () => pick(i)) });
if (rows.length && !reduce) { let n = 0, t; const auto = () => { t = setInterval(() => { n = (n + 1) % rows.length; pick(n) }, 5000) }; auto(); $('.split')?.addEventListener('mouseenter', () => clearInterval(t)); $('.split')?.addEventListener('mouseleave', () => { clearInterval(t); auto() }); rows.forEach((r, i) => r.addEventListener('click', () => n = i)) }

/* ---------- toast ---------- */
const toast = m => { const t = $('#toast'); if (!t) return; t.textContent = m; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2600) };
$$('[data-plan]').forEach(b => b.addEventListener('click', () => { try { sessionStorage.setItem('stacklyfit-plan', b.dataset.plan) } catch { } }));

/* ---------- pricing: billing toggle with sliding pill + count animation ---------- */
const bill = $('#bill');
if (bill) {
  const pill = $('.pill', bill), setPill = b => { pill.style.left = b.offsetLeft + 'px'; pill.style.width = b.offsetWidth + 'px' };
  const btns = $$('button', bill); setPill($('.on', bill) || btns[0]);
  addEventListener('resize', () => setPill($('.on', bill)));
  document.fonts?.ready.then(() => setPill($('.on', bill)));
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.classList.toggle('on', x === b)); setPill(b);
    $$('[data-m]').forEach(p => {
      const to = +p.dataset[b.dataset.k], from = +p.textContent.slice(1), s = performance.now();
      (function f(n) { const k = Math.min((n - s) / 550, 1), e = 1 - Math.pow(1 - k, 3); p.textContent = '$' + Math.round(from + (to - from) * e); k < 1 && requestAnimationFrame(f) })(s)
    });
    toast(b.dataset.k === 'y' ? 'Yearly billing — you save 20%' : 'Monthly billing selected')
  }))
}

/* ---------- FAQ accordion ---------- */
$$('.q button').forEach(b => b.addEventListener('click', () => {
  const q = b.parentElement, open = !q.classList.contains('open');
  $$('.q').forEach(x => { x.classList.remove('open'); $('button', x).setAttribute('aria-expanded', 'false') });
  if (open) { q.classList.add('open'); b.setAttribute('aria-expanded', 'true') }
}));

/* ---------- programs: category filter + search ---------- */
const pcs = $$('.pc');
if (pcs.length) {
  let cat = 'all', q = '';
  const apply = () => {
    let hits = 0;
    pcs.forEach(c => {
      const txt = c.textContent.toLowerCase(), ok = (cat === 'all' || c.dataset.c === cat) && (!q || txt.includes(q));
      c.classList.toggle('dim', !ok); if (ok) hits++
    });
    const nr = $('.nores'); if (nr) nr.style.display = hits ? 'none' : 'block'
  };
  $$('.cat').forEach(b => b.addEventListener('click', () => {
    const same = b.classList.contains('on'); $$('.cat').forEach(x => x.classList.remove('on'));
    cat = same ? 'all' : b.dataset.f; if (!same) b.classList.add('on'); apply();
    $('#popular')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }));
  const qs = new URLSearchParams(location.search).get('q');
  if (qs) { q = qs.toLowerCase().trim(); const inp = $('.hsearch input'); if (inp) inp.value = qs; apply(); setTimeout(() => $('#popular')?.scrollIntoView({ behavior: 'smooth' }), 2400) }
  $('.hsearch')?.addEventListener('submit', e => { e.preventDefault(); q = $('input', e.currentTarget).value.toLowerCase().trim(); apply(); $('#popular')?.scrollIntoView({ behavior: 'smooth' }) });
}
