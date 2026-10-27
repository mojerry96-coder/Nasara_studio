/* Nasara Studios: no build step. Serve this folder and open index.html. */
(() => {
  'use strict';
  const C = window.NASARA_CONFIG, TONES = window.NASARA_TONES || {};
  const params = new URLSearchParams(location.search);
  const capture = params.has('capture');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = matchMedia('(hover: hover) and (pointer: fine)');
  const narrow = matchMedia('(max-width: 960px)');
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const money = n => new Intl.NumberFormat(C.locale, {style:'currency', currency:C.currency, maximumFractionDigits:0}).format(n);
  const html = document.documentElement, main = $('#main'), dialog = $('#dialog');
  const productIds = Object.keys(C.products), works = C.works, contact = C.contact || {};
  const workById = id => works.find(w => w.id === id);
  let filter = 'All', portfolioFilter = 'All', route = '', navId = 0, restoreFocus, viewer = null;
  if (capture) html.classList.add('capture');

  /* ---------- Icons & primitives ---------- */
  const icon = {
    bag: '<svg viewBox="0 0 24 26" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M4 7h16l2 17H2L4 7Z"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/></svg>',
    close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M2 2l12 12M14 2 2 14"/></svg>',
    prev: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M9 2 4 7l5 5"/></svg>',
    next: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="m5 2 5 5-5 5"/></svg>',
    play: '<svg viewBox="0 0 9 10" fill="currentColor" aria-hidden="true"><path d="M0 0l9 5-9 5z"/></svg>',
    pause: '<svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M2 1h3v10H2zM7 1h3v10H7z"/></svg>'
  };
  const arrow = '<span class="arrow" aria-hidden="true">→</span>';
  const link = (label, to, cls = 'link') => `<a class="${cls}" href="#${to}">${label}</a>`;
  const btn = (label, act, cls = 'button', extra = '') => `<button type="button" class="${cls}" data-action="${act}" ${extra}>${label}</button>`;
  const lockup = '<span class="lockup"><span class="lockup-word">NASARA</span><span class="lockup-sub">STUDIOS</span></span>';
  const isPaper = src => src.includes('/ill/');
  const toneOf = src => TONES[src] || (isPaper(src) ? '#efe9de' : '#2b2533');
  const thumbOf = src => /\/(ill|3d)\//.test(src) ? src.replace('.jpg', '-t.jpg') : src;
  /* A media item is either {src} (image) or {film:{src,poster}}. */
  const still = m => m.film ? m.film.poster : m.src;
  const frame = (src, {film = null, alt = '', tag = '', eager = false, thumb = true, cls = ''} = {}) =>
    `<div class="frame ${isPaper(src) ? 'paper' : ''} ${cls}" style="--tone:${toneOf(src)}" ${film ? `data-film="${esc(film.src)}"` : ''}>${tag ? `<span class="tag">${tag}</span>` : ''}<img src="${esc(thumb ? thumbOf(src) : src)}" alt="${esc(alt)}" ${eager ? '' : 'loading="lazy"'} decoding="async"></div>`;

  function slides(list, {contain = false, dur = 6500, offset = 0, id = ''} = {}) {
    return `<div class="slides ${contain ? 'contain' : ''}" data-slides data-dur="${dur}" data-offset="${offset}" ${id ? `id="${id}"` : ''} style="--tone:${toneOf(still(list[0]))}">${list.map((m, i) => {
      const t = toneOf(still(m)), lazy = i > 1;
      const media = m.film
        ? `<video muted playsinline loop preload="${i === 0 ? 'auto' : 'none'}" poster="${esc(m.film.poster)}" data-start="${m.film.start || 0}" ${lazy ? `data-src="${esc(m.film.src)}"` : `src="${esc(m.film.src)}"`}></video>`
        : `<img ${lazy ? 'data-src' : 'src'}="${esc(m.src)}" alt="" decoding="async">`;
      return `<div class="slide${i === 0 ? ' is-active' : ''}" style="--tone:${t}">${media}</div>`;
    }).join('')}</div>`;
  }
  const field = (label, name, type = 'text', required = true) => `<label class="field">${label}<input name="${name}" type="${type}" ${required ? 'required' : ''} ${type === 'email' ? 'autocomplete="email"' : name === 'name' ? 'autocomplete="name"' : ''} maxlength="${name === 'name' ? 100 : 320}"></label>`;
  const consent = () => '<label class="check"><input type="checkbox" name="marketing"><span>Send me studio tips and new releases.<small>Optional. Unsubscribe anytime.</small></span></label>';
  const accordion = rows => rows.filter(([, b]) => b).length ? `<div class="details-list">${rows.filter(([, b]) => b).map(([t, b]) => `<details><summary>${t}</summary><div class="details-body">${b}</div></details>`).join('')}</div>` : '';
  const priceOf = p => p.price == null ? '' : money(p.price);
  const filmCount = w => w.films?.length || 0, imgCount = w => w.images?.length || 0;
  const metaOf = w => [imgCount(w) && `${imgCount(w)} ${imgCount(w) === 1 ? 'image' : 'images'}`, filmCount(w) && `${filmCount(w)} ${filmCount(w) === 1 ? 'film' : 'films'}`].filter(Boolean).join(' · ');
  const coverOf = w => w.images?.[0] || w.films[0].poster;
  const mediaOf = w => [...(w.images || []).map(src => ({src})), ...(w.films || []).map(film => ({film}))];

  /* ---------- Offers ----------
     The site persuades, the store transacts: every offer has one button that goes straight to
     where it is bought (Selar when a link is set, otherwise a ready-to-send WhatsApp message). */
  const waLink = text => `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}`;
  function offer(id) {
    const p = C.products[id], isBook = id === 'book';
    if (p.buyUrl) return {href: p.buyUrl, label: isBook ? 'Buy the book' : 'Enrol now'};
    const ask = `Hello Nasara Studios, I would like to ${isBook ? 'order the Fashion Illustration book' : `enrol in the ${p.title} course`}.`;
    if (contact.whatsapp) return {href: waLink(ask), label: isBook ? 'Order on WhatsApp' : 'Enrol on WhatsApp'};
    if (contact.email) return {href: `mailto:${contact.email}?subject=${encodeURIComponent(p.title)}&body=${encodeURIComponent(ask)}`, label: isBook ? 'Order the book' : 'Enrol now'};
    return {href: `#${id}`, label: 'Learn more', internal: true};
  }
  const offerButton = (id, cls = 'button') => { const o = offer(id); return `<a class="${cls}" href="${esc(o.href)}" ${o.internal ? '' : 'target="_blank" rel="noopener"'}>${o.label} ${arrow}</a>`; };

  /* ---------- Shared blocks ---------- */
  function productCard(id, i = 0) {
    const p = C.products[id];
    return `<div class="card reveal" style="--d:${i}"><a class="card-link" href="#${id}">${frame(p.image, {film: p.hover, alt: p.title})}<div class="card-body"><span class="card-kind">${p.kind}</span><span class="card-title">${p.title}</span><span class="card-price">${priceOf(p)}</span><p class="card-text">${p.description}</p></div></a><div class="card-cta">${offerButton(id, 'button ghost full')}</div></div>`;
  }
  const mentorCard = (i = 3) => `<div class="card reveal" style="--d:${i}"><a class="card-link" href="#mentorship">${frame(C.mentorshipCard.image, {alt: '1:1 Mentorship'})}<div class="card-body"><span class="card-kind">Personal guidance</span><span class="card-title">1:1 Mentorship</span><span class="card-price"></span><p class="card-text">${C.mentorshipCard.description}</p></div></a><div class="card-cta">${link(`Book a session ${arrow}`, 'mentorship', 'button ghost full')}</div></div>`;
  function workCard(w, i) {
    return `<a class="card" style="--i:${Math.min(i, 12)}" href="#project/${w.id}">${frame(coverOf(w), {film: w.films?.[0], alt: `${w.title}, ${w.kind}`, tag: filmCount(w) && !imgCount(w) ? 'Film' : ''})}<div class="card-body"><span class="card-kind">${w.kind}</span><span class="card-title">${esc(w.title)}</span><span class="card-price small">${metaOf(w)}</span></div></a>`;
  }
  const sampleForm = (light = false) => `<form data-form="lead"><div class="inline-form">${field('Email address', 'email', 'email')}<button class="button${light ? ' light' : ''}" type="submit">Send me the sample ${arrow}</button></div>${consent()}<div class="form-status" role="status" aria-live="polite"></div></form>`;
  const sampleBand = () => `<section class="section band-paper"><div class="container sample reveal"><div><span class="eyebrow">Free sample</span><h2>Take a little inspiration.</h2><p class="lead">Free pages from the book, sent to your inbox.</p></div>${sampleForm()}</div></section>`;
  const ctaPair = () => `<section class="band-plum"><div class="container cta-pair">
      <div class="reveal"><span class="eyebrow">1:1 Mentorship</span><h2>Your next creative step.</h2>${link(`Request a session ${arrow}`, 'mentorship', 'button light')}</div>
      <div class="reveal" style="--d:1"><span class="eyebrow">Commissions</span><h2>Let’s create together.</h2>${link(`Start a project ${arrow}`, 'hire', 'button outline-light')}</div>
    </div></section>`;

  /* ---------- Header & footer ---------- */
  function header() {
    const base = route.split('/')[0];
    const current = r => (base === r || (r === 'portfolio' && base === 'project') || (r === 'shop' && ['course-3d', 'course-ai', 'book'].includes(base))) ? 'aria-current="page"' : '';
    const h = $('#header');
    h.className = `site-header${base === 'home' ? ' over' : ''}`;
    h.innerHTML = `<div class="container header-inner"><a class="wordmark" href="#home" aria-label="Nasara Studios home">${lockup}</a>
      <nav class="main-nav" id="navigation" aria-label="Main">${[['Learn & Shop', 'shop'], ['Portfolio', 'portfolio'], ['Mentorship', 'mentorship']].map(([t, r]) => `<a class="nav-link" href="#${r}" ${current(r)}>${t}</a>`).join('')}<a class="nav-link mobile-only" href="#hire" ${current('hire')}>Hire me</a></nav>
      <div class="header-actions"><a class="nav-link header-hire" href="#hire" ${current('hire')}>Hire me</a><button type="button" class="menu-toggle" data-action="menu" aria-controls="navigation" aria-expanded="false" aria-label="Open menu"><i></i></button></div></div>`;
    onScroll();
  }
  function footer() {
    const connect = [contact.instagram && `<a href="${esc(contact.instagram)}" target="_blank" rel="noopener">Instagram</a>`, contact.store && `<a href="${esc(contact.store)}" target="_blank" rel="noopener">Store</a>`, contact.email && `<a href="mailto:${esc(contact.email)}">Email</a>`, contact.whatsapp && `<a href="https://wa.me/${esc(contact.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a>`].filter(Boolean);
    const pol = Object.entries({refund: 'Refund policy', terms: 'Terms', privacy: 'Privacy'}).filter(([k]) => C.policies?.[k]).map(([k, t]) => `<a href="${esc(C.policies[k])}">${t}</a>`).join(' · ');
    $('#footer').innerHTML = `<div class="container footer-top"><div class="footer-intro">${lockup}<p>Fashion education & creative studio.</p></div>
      <div class="footer-col"><h4>Learn</h4>${link('3D Fashion Design', 'course-3d', '')}${link('AI Fashion Film', 'course-ai', '')}${link('The book', 'book', '')}${link('Mentorship', 'mentorship', '')}</div>
      <div class="footer-col"><h4>Studio</h4>${link('Portfolio', 'portfolio', '')}${link('Hire me', 'hire', '')}<a href="#sample" data-action="sample">Free book sample</a></div>
      ${connect.length ? `<div class="footer-col"><h4>Connect</h4>${connect.join('')}</div>` : ''}</div>
      <div class="container"><span class="footer-mark" aria-hidden="true">NASARA</span></div>
      <div class="container footer-base"><span>© ${new Date().getFullYear()} Nasara Studios. All rights reserved.</span><span>${pol}</span></div>`;
  }
  function onScroll() {
    const h = $('#header'); if (!h) return;
    const hero = $('.hero');
    const threshold = hero ? hero.offsetHeight - h.offsetHeight - 10 : 8;
    h.classList.toggle('scrolled', scrollY > threshold);
  }
  addEventListener('scroll', onScroll, {passive: true});

  /* ---------- Pages ---------- */
  function home() {
    const panels = narrow.matches ? [C.heroes.home[1].flatMap((m, i) => [m, C.heroes.home[0][i], C.heroes.home[2][i]].filter(Boolean))] : C.heroes.home;
    const hero = `<section class="hero" aria-label="Featured work"><div class="hero-panels">${panels.map((list, i) => slides(list, {dur: 7200, offset: i * 1100})).join('')}</div>
      <div class="hero-copy enter"><span class="eyebrow">Fashion education & creative studio</span><h1>Ideas, brought to life.</h1><p>Courses, a book and mentorship in illustration, 3D and AI fashion.</p><div class="actions">${link(`Explore courses ${arrow}`, 'shop', 'button light')}${link('View the work', 'portfolio', 'link')}</div></div></section>`;

    const offers = `<section class="section"><div class="container"><div class="section-head reveal"><div><span class="eyebrow">Learn & Shop</span><h2>Start creating with Nasara.</h2></div>${link(`View all ${arrow}`, 'shop')}</div>
      <div class="grid">${productIds.map(productCard).join('')}${mentorCard()}</div></div></section>`;

    const corset = workById('corset'), main3d = corset.images[0];
    const strip = [3, 4, 1, 2].map(k => corset.images[k]);
    const feature3d = `<section class="feature-strip reveal-block" style="--tone:${toneOf(main3d)}"><div class="fs-main"><img src="${main3d}" alt="Corset study, 3D garment" loading="lazy"></div>
      <div class="fs-strip">${strip.map((src, i) => `<a href="#project/corset" style="--d:${i}" class="frame" aria-label="Corset study detail ${i + 1}"><img src="${src}" alt="" loading="lazy"></a>`).join('')}</div>
      <div class="fs-copy on-dark"><span class="eyebrow">Online course</span><h2>3D Fashion Design</h2><div class="actions">${link(`Explore the course ${arrow}`, 'course-3d', 'button light')}</div></div></section>`;

    const book = C.products.book;
    const bookFeature = `<section class="split-feature"><div class="sf-text reveal"><span class="eyebrow">The book</span><h2>Fashion Illustration</h2><p class="lead">${priceOf(book)}</p>
      <div class="mini-carousel" data-carousel><button type="button" class="mini-nav" data-action="mini" data-dir="-1" aria-label="Previous page">${icon.prev}</button>${frame(book.pages[0], {alt: 'Page from the book'})}<button type="button" class="mini-nav" data-action="mini" data-dir="1" aria-label="Next page">${icon.next}</button></div>
      <p class="mini-caption"><span data-mini-count>1</span> / ${book.pages.length}</p>
      <div class="actions" style="justify-content:center">${offerButton('book')}${btn('Look inside', 'look', 'link')}</div></div>
      <div class="sf-media">${slides(C.heroes.book.map(s => s), {contain: true, dur: 5200})}</div></section>`;

    const ai = C.products['course-ai'];
    const aiFeature = `<section class="info-feature"><div class="if-panel reveal"><span class="eyebrow">Online course</span>
      ${frame('media/poster/ai-chghtggj1ngaaaaab-n-ba-0-raw-video-2.jpg', {cls: 'if-detail', alt: 'AI fashion portrait', thumb: false})}
      <ul class="spec-list">${[['Concept', 'Briefs & prompts'], ['Motion', 'Still to film'], ['Price', priceOf(ai)]].map(([a, b]) => `<li><span>${a}</span><span>${b}</span></li>`).join('')}</ul>
      <div class="if-thumbs">${['bronze-petal', 'cobalt-polka', 'petal-bloom'].map(id => { const w = workById(id); return `<a href="#project/${id}" aria-label="${esc(w.title)}">${frame(coverOf(w), {alt: ''})}</a>`; }).join('')}</div>
      <div class="actions">${link(`Explore the course ${arrow}`, 'course-ai', 'button')}</div></div>
      <div class="if-media">${slides(C.heroes.courseAi, {dur: 6800})}<div class="if-title"><span class="eyebrow">${ai.title}</span><h2>From still<br>to motion.</h2></div></div></section>`;

    const picks = ['black-gown', 'lilac-silk', 'terracotta-coat', 'couture-gowns', null, 'corset', 'gold-structure', 'cobalt-polka', 'ivory-silk'];
    const mosaic = `<section class="section"><div class="container"><div class="mosaic">${picks.map((id, i) => {
      if (!id) return `<div class="m-text reveal" style="--d:2"><div><span class="eyebrow" style="color:rgba(247,242,233,.7)">Portfolio</span></div><div><h2>Selected work</h2>${link(`View the portfolio ${arrow}`, 'portfolio', 'link')}</div></div>`;
      const w = workById(id), src = id === 'corset' ? w.images[0] : coverOf(w);
      return `<a class="tile-link reveal ${i === 0 ? 'm-big' : ''} ${isPaper(src) ? 'paper' : ''}" style="--tone:${toneOf(src)};--d:${i % 4}" href="#project/${id}" ${w.films?.length ? `data-film="${esc(w.films[0].src)}"` : ''}><img src="${i === 0 ? src : thumbOf(src)}" alt="${esc(w.title)}" loading="lazy"><span class="tile-cap"><strong>${esc(w.title)}</strong><small>${w.kind}</small></span></a>`;
    }).join('')}</div></div></section>`;

    return hero + offers + feature3d + bookFeature + aiFeature + mosaic + ctaPair() + sampleBand();
  }

  function shop() {
    const ids = productIds.filter(id => filter === 'All' || (filter === 'Courses' && id.startsWith('course')) || (filter === 'Book' && id === 'book'));
    const mentor = filter === 'All' || filter === 'Mentorship';
    return `<div class="container"><header class="page-head enter"><div><span class="eyebrow">Learn & Shop</span><h1>Courses, book & mentorship.</h1><p class="lead">Learn at your own pace, or one-to-one.</p></div>
      <div class="filters" role="group" aria-label="Filter">${['All', 'Courses', 'Book', 'Mentorship'].map(x => btn(x, 'filter', 'filter', `aria-pressed="${filter === x}" data-id="${x}"`)).join('')}</div></header>
      <div class="grid grid-anim">${ids.map((id, i) => productCard(id, i).replace('card reveal', 'card').replace('--d:', '--i:')).join('')}${mentor ? mentorCard(ids.length).replace('card reveal', 'card').replace('--d:', '--i:') : ''}</div></div>
      <div style="height:var(--section)"></div>${ctaPair()}${sampleBand()}`;
  }

  function pdp({panel, list, id, contain = true}) {
    return `<section class="pdp"><div class="pdp-panel enter">${panel}</div><div class="pdp-media">${slides(list, {contain, dur: 6500, id})}</div></section>`;
  }
  const thumbs = (list, target) => list.length > 1 ? `<div class="pdp-thumbs" data-for="${target}">${list.map((m, i) => { const s = still(m); return `<button type="button" class="${isPaper(s) ? 'paper' : ''}" style="--tone:${toneOf(s)}" data-action="slide" data-id="${i}" aria-label="Show view ${i + 1}" aria-current="${i === 0}"><img src="${thumbOf(s)}" alt="" loading="lazy">${m.film ? `<span class="fl">${icon.play}</span>` : ''}</button>`; }).join('')}</div>` : '';

  function course(id) {
    const p = C.products[id], list = id === 'course-3d' ? C.heroes.course3d : C.heroes.courseAi;
    const panel = `${link('← Learn & Shop', 'shop', 'back')}<span class="eyebrow">${p.kind}</span><h1>${p.title}</h1><p class="lead">${p.description}</p>${priceOf(p) ? `<p class="pdp-price">${priceOf(p)}</p>` : ''}
      <div class="actions">${offerButton(id)}${btn('Watch preview', 'preview', 'link', `data-id="${id}"`)}</div>
      ${thumbs(list, 'pdp-show')}
      <div class="panel-block"><span class="eyebrow">What you’ll learn</span><ol class="learn-list">${p.learn.map((x, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span>${x}</li>`).join('')}</ol></div>
      <div class="panel-block">${accordion([['Overview', esc(p.overview)], ['Who it’s for', esc(p.audience)], ['Access & requirements', esc(p.access)]])}</div>
      <p class="small" style="margin-top:32px">${link(`1:1 Mentorship ${arrow}`, 'mentorship')}</p>`;
    const kind = id === 'course-3d' ? '3D' : 'AI';
    const related = works.filter(w => w.kind === kind).slice(0, 4);
    return pdp({panel, list, id: 'pdp-show'}) + `<section class="section"><div class="container"><div class="section-head reveal"><div><span class="eyebrow">From the studio</span><h2>Made with these skills.</h2></div>${link(`View the portfolio ${arrow}`, 'portfolio')}</div><div class="grid">${related.map((w, i) => workCard(w, i).replace('class="card" style="--i:', 'class="card reveal" style="--d:')).join('')}</div></div></section>` + ctaPair();
  }

  function book() {
    const p = C.products.book, list = C.heroes.book;
    const panel = `${link('← Learn & Shop', 'shop', 'back')}<span class="eyebrow">The book</span><h1>Fashion Illustration</h1><p class="lead">${p.description}</p>${priceOf(p) ? `<p class="pdp-price">${priceOf(p)}</p>` : ''}
      <div class="actions">${offerButton('book')}${btn('Look inside', 'look', 'link')}</div>
      ${thumbs(list, 'pdp-show')}
      <div class="panel-block"><span class="eyebrow">Free sample</span><h3 style="margin-bottom:20px">Take a little inspiration.</h3>${sampleForm()}</div>
      <div class="panel-block">${accordion([['About the book', esc(p.overview)], ['Format & delivery', esc(p.format)]])}</div>`;
    return pdp({panel, list, id: 'pdp-show'}) + ctaPair();
  }

  function enquiryForm(kind) {
    const mentor = kind === 'mentorship';
    const options = ['Illustration', '3D fashion', 'AI fashion', ...(mentor ? ['Portfolio review'] : [])];
    return `<form data-form="enquiry" data-kind="${kind}"><div class="two-fields">${field('Your name', 'name')}${field('Email address', 'email', 'email')}</div>
      <fieldset class="choice-group"><legend>${mentor ? 'Your focus' : 'Project type'}</legend><div class="choices">${options.map(x => `<label><input type="radio" name="interest" value="${x}" required><span>${x}</span></label>`).join('')}</div></fieldset>
      <label class="field">${mentor ? 'What would you like to work on?' : 'Tell me about your idea'}<textarea name="message" required maxlength="2000" rows="4"></textarea></label>
      ${mentor ? '' : `<div class="two-fields">${field('Budget (optional)', 'budget', 'text', false)}${field('Timeline (optional)', 'timeline', 'text', false)}</div>${field('Reference link (optional)', 'reference', 'url', false)}`}
      <button class="button full" type="submit">${mentor ? 'Request a session' : 'Send project enquiry'} ${arrow}</button><div class="form-status" role="status" aria-live="polite"></div>
      <p class="form-note">${mentor ? 'We’ll confirm the fee and a time that suits you before anything is booked.' : 'We reply to every enquiry personally.'}${contact.whatsapp ? ` Prefer to chat? <a class="link" href="https://wa.me/${esc(contact.whatsapp)}" target="_blank" rel="noopener">Message us on WhatsApp</a>` : ''}</p></form>`;
  }
  const mentorship = () => pdp({id: 'pdp-show', list: C.heroes.mentorship, panel: `<span class="eyebrow">1:1 Mentorship</span><h1>Your next creative step.</h1><p class="lead">One-to-one guidance for your practice and portfolio.</p>${enquiryForm('mentorship')}`});
  const hire = () => pdp({id: 'pdp-show', list: C.heroes.hire, panel: `<span class="eyebrow">Work with Nasara Studios</span><h1>Let’s create.</h1><p class="lead">Illustration, 3D garments and AI fashion imagery.</p>${enquiryForm('hire')}`});

  function portfolio() {
    const list = works.filter(w => portfolioFilter === 'All' || w.kind === portfolioFilter);
    return `<div class="container"><header class="page-head enter"><div><span class="eyebrow">Portfolio</span><h1>Selected work.</h1><p class="lead">Illustration, 3D and AI fashion.</p></div>
      <div class="filters" role="group" aria-label="Filter">${['All', 'Illustration', '3D', 'AI'].map(x => btn(x, 'portfolio-filter', 'filter', `aria-pressed="${portfolioFilter === x}" data-id="${x}"`)).join('')}</div></header>
      <div class="grid grid-anim">${list.map(workCard).join('')}</div></div><div style="height:var(--section)"></div>${ctaPair()}`;
  }

  function project(id) {
    const i = Math.max(0, works.findIndex(w => w.id === id)), w = works[i], next = works[(i + 1) % works.length];
    const list = mediaOf(w);
    const learn = w.kind === '3D' ? ['course-3d', '3D Fashion Design course'] : w.kind === 'AI' ? ['course-ai', 'AI Fashion Film course'] : ['book', 'Fashion Illustration book'];
    const panel = `${link('← Portfolio', 'portfolio', 'back')}<span class="eyebrow">${w.kind}</span><h1>${esc(w.title)}</h1><p class="small" style="margin:-6px 0 32px">${metaOf(w)}</p>
      <div class="actions">${link(`Commission similar work ${arrow}`, 'hire', 'button')}</div>
      ${thumbs(list, 'pdp-show')}
      <p class="small" style="margin-top:36px">${link(`Learn it: ${learn[1]} ${arrow}`, learn[0])}</p>`;
    const gallery = `<section class="section"><div class="container"><div class="section-head reveal"><div><span class="eyebrow">${metaOf(w)}</span><h2>All views</h2></div></div>
      <div class="grid">${list.map((m, k) => `<button type="button" class="tile reveal ${m.film ? 'film' : ''}" style="--d:${k % 4}" data-action="view" data-id="${k}" aria-label="Open ${m.film ? 'film' : 'image'} ${k + 1}">${frame(still(m), {film: m.film, tag: m.film ? 'Film' : ''})}<span class="tile-label"><span>${m.film ? (m.film.label || 'Film') : `View ${String(k + 1).padStart(2, '0')}`}</span><span>${m.film ? 'Play' : 'Enlarge'}</span></span></button>`).join('')}</div>
      <a class="next-project" href="#project/${next.id}" style="margin-top:var(--section)"><div><span class="eyebrow" style="margin-bottom:10px">Next project</span><h3>${esc(next.title)}</h3></div><span class="link">View ${arrow}</span></a></div></section>`;
    return pdp({panel, list, id: 'pdp-show'}).replace('<section class="pdp"', `<section class="pdp" data-work="${w.id}"`) + gallery + ctaPair();
  }

  /* ---------- Slideshows ---------- */
  let shows = [], showObserver, revealObserver;
  function loadSlide(el) {
    const m = el?.firstElementChild; if (!m || !m.dataset.src) return;
    m.src = m.dataset.src; delete m.dataset.src; if (m.tagName === 'VIDEO') m.preload = 'auto';
  }
  function playActive(s) {
    s.slides.forEach((el, k) => { const v = el.querySelector('video'); if (!v) return; if (k === s.i && s.visible && !document.hidden) { v.play().catch(() => {}); } else if (k !== s.i) setTimeout(() => { if (!el.classList.contains('is-active')) v.pause(); }, 1900); else v.pause(); });
  }
  function goSlide(s, k) {
    if (k === s.i) return;
    loadSlide(s.slides[k]); const v = s.slides[k].querySelector('video'); if (v) { try { v.currentTime = +v.dataset.start || 0; } catch {} }
    s.slides[s.i].classList.remove('is-active'); s.slides[k].classList.add('is-active'); s.i = k;
    loadSlide(s.slides[(k + 1) % s.slides.length]);
    playActive(s);
    if (s.el.id) $$(`[data-for="${s.el.id}"] button`).forEach((b, j) => b.setAttribute('aria-current', j === k));
  }
  function schedule(s, delay) { clearTimeout(s.timer); if (s.slides.length > 1 && !motion.matches && !capture) s.timer = setTimeout(() => { if (s.paused || !s.visible || document.hidden) return schedule(s, 900); goSlide(s, (s.i + 1) % s.slides.length); schedule(s, s.dur); }, delay); }
  function startShows() {
    shows.forEach(s => clearTimeout(s.timer)); showObserver?.disconnect();
    shows = $$('[data-slides]', main).map(el => ({el, slides: [...el.children], i: 0, dur: +el.dataset.dur || 6500, visible: true, paused: false}));
    showObserver = new IntersectionObserver(es => es.forEach(e => { const s = shows.find(x => x.el === e.target); if (!s) return; s.visible = e.isIntersecting; playActive(s); }), {threshold: .1});
    $$('video[data-start]', main).forEach(v => { const t = +v.dataset.start; if (t) v.addEventListener('loadedmetadata', () => { if (v.currentTime < t) v.currentTime = t; }, {once: true}); });
    shows.forEach(s => { loadSlide(s.slides[1]); showObserver.observe(s.el); schedule(s, s.dur + (+s.el.dataset.offset || 0)); });
  }
  function wireReveal() {
    revealObserver?.disconnect();
    revealObserver = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObserver.unobserve(e.target); } }), {rootMargin: '0px 0px -10% 0px'});
    $$('.reveal, .feature-strip', main).forEach(el => revealObserver.observe(el));
  }

  /* Card films play only while a pointer rests on them. */
  main.addEventListener('pointerover', e => {
    if (!canHover.matches || motion.matches) return;
    const box = e.target.closest('[data-film]'); if (!box || box.contains(e.relatedTarget)) return;
    let v = box.querySelector(':scope > video');
    if (!v) { v = document.createElement('video'); Object.assign(v, {muted: true, loop: true, playsInline: true, preload: 'auto'}); v.src = box.dataset.film; box.append(v); v.addEventListener('playing', () => box.classList.add('playing')); }
    v.play().catch(() => {});
  });
  main.addEventListener('pointerout', e => {
    const box = e.target.closest('[data-film]'); if (!box || box.contains(e.relatedTarget)) return;
    const v = box.querySelector(':scope > video'); if (v) { v.pause(); box.classList.remove('playing'); }
  });

  /* ---------- Router ---------- */
  const renderers = {home, shop, 'course-3d': () => course('course-3d'), 'course-ai': () => course('course-ai'), book, mentorship, portfolio, hire};
  function render(focus = false) {
    const [base, sub] = route.split('/');
    main.innerHTML = base === 'project' ? project(sub) : (renderers[base] || home)();
    header();
    $$('.enter > *', main).forEach((x, i) => x.style.setProperty('--i', Math.min(i, 6)));
    main.className = 'page-enter';
    const h1 = main.querySelector('h1');
    document.title = base === 'home' ? 'Nasara Studios | Fashion education & creative studio' : `${h1 ? h1.innerText.replace(/\s+/g, ' ').replace(/\.$/, '') : 'Nasara Studios'} | Nasara Studios`;
    startShows(); wireReveal();
    if (focus) { main.focus({preventScroll: true}); scrollTo({top: 0, behavior: 'instant'}); }
  }
  function resolve() {
    let r = location.hash.slice(1) || 'home';
    const [base, sub] = r.split('/');
    if (base === 'project') return workById(sub) ? r : 'portfolio';
    if (base === 'checkout') return 'shop';
    return renderers[base] ? base : 'home';
  }
  async function navigate() {
    if (['#main', '#sample'].includes(location.hash)) return;
    const id = ++navId;
    if (dialog.open) dialog.close();
    main.className = 'page-exit';
    if (!motion.matches && !capture) await sleep(200);
    if (id !== navId) return;
    route = resolve(); filter = 'All'; portfolioFilter = 'All';
    render(true);
  }
  addEventListener('hashchange', navigate);
  narrow.addEventListener('change', () => { if (route === 'home') render(); });

  /* ---------- Bag & dialogs ---------- */
  function modal(title, body, cls = '') {
    if (!dialog.open) restoreFocus = document.activeElement;
    dialog.className = cls;
    dialog.innerHTML = `${btn(icon.close, 'close', 'close-dialog', 'aria-label="Close"')}${title ? `<h2 id="dialog-title">${title}</h2>` : '<span id="dialog-title" hidden>Viewer</span>'}${body}`;
    if (!dialog.open) dialog.showModal();
  }
  function showPreview(id) {
    const f = C.products[id]?.preview; if (!f) return;
    viewer = null;
    modal('', `<div class="viewer-stage" style="grid-template-columns:1fr"><div class="frame" style="--tone:${toneOf(f.poster)}"><video controls autoplay muted playsinline preload="auto" poster="${esc(f.poster)}" src="${esc(f.src)}"></video></div></div><div class="viewer-meta" style="padding-left:0"><span>${C.products[id].title}, preview</span></div>`, 'viewer');
  }
  function openViewer(list, k, title) {
    viewer = {list, k: (k + list.length) % list.length, title};
    const m = viewer.list[viewer.k], s = still(m);
    modal('', `<div class="viewer-stage">${list.length > 1 ? btn(icon.prev, 'viewer-step', 'viewer-nav', 'data-id="-1" aria-label="Previous"') : '<span></span>'}<div class="frame ${isPaper(s) ? 'paper' : ''}" style="--tone:${toneOf(s)}">${m.film ? `<video controls autoplay muted loop playsinline poster="${esc(m.film.poster)}" src="${esc(m.film.src)}"></video>` : `<img src="${esc(m.src)}" alt="${esc(title)}, view ${viewer.k + 1}">`}</div>${list.length > 1 ? btn(icon.next, 'viewer-step', 'viewer-nav', 'data-id="1" aria-label="Next"') : '<span></span>'}</div><div class="viewer-meta"><span>${esc(title)}${m.film?.label ? `, ${esc(m.film.label)}` : ''}</span><span>${viewer.k + 1} / ${list.length}</span></div>`, 'viewer');
  }
  let miniIndex = 0;
  document.addEventListener('click', e => {
    if (e.target.closest('.skip-link')) { e.preventDefault(); main.focus(); return; }
    const b = e.target.closest('[data-action]'); if (!b) return;
    const id = b.dataset.id;
    switch (b.dataset.action) {
      case 'menu': { const nav = $('#navigation'), open = nav.classList.toggle('open'); b.setAttribute('aria-expanded', open); b.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); $('#header').classList.toggle('menu-open', open); document.body.style.overflow = open ? 'hidden' : ''; break; }
      case 'close': dialog.close(); break;
      case 'filter': filter = id; render(); $(`[data-action="filter"][data-id="${id}"]`, main)?.focus(); break;
      case 'portfolio-filter': portfolioFilter = id; render(); $(`[data-action="portfolio-filter"][data-id="${id}"]`, main)?.focus(); break;
      case 'sample': e.preventDefault(); modal('Take a little inspiration.', `<p class="lead">Get pages from the Fashion Illustration book in your inbox.</p>${sampleForm()}`); break;
      case 'look': modal('Inside the book', `<div class="page-strip">${C.products.book.pages.map(src => frame(src, {alt: 'Page from the book'})).join('')}</div><div class="actions">${offerButton('book')}${btn('Get a free sample', 'sample', 'link')}</div>`, 'wide'); break;
      case 'preview': showPreview(id); break;
      case 'slide': { const s = shows.find(x => x.el.id === b.closest('[data-for]').dataset.for); if (s) { goSlide(s, +id); schedule(s, s.dur * 1.6); } break; }
      case 'view': { const w = workById(main.querySelector('[data-work]')?.dataset.work); if (w) openViewer(mediaOf(w), +id, w.title); break; }
      case 'viewer-step': if (viewer) openViewer(viewer.list, viewer.k + (+id), viewer.title); break;
      case 'mini': {
        const pages = C.products.book.pages; miniIndex = (miniIndex + (+b.dataset.dir) + pages.length) % pages.length;
        const car = b.closest('[data-carousel]'), img = $('.frame img', car);
        img.style.opacity = 0; setTimeout(() => { img.src = thumbOf(pages[miniIndex]); img.onload = () => img.style.opacity = 1; }, 250);
        $('[data-mini-count]', main).textContent = miniIndex + 1; break;
      }
    }
  });
  dialog.addEventListener('close', () => { $$('video', dialog).forEach(v => v.pause()); viewer = null; if (restoreFocus?.isConnected) restoreFocus.focus(); });
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  document.addEventListener('keydown', e => {
    if (viewer && dialog.open && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { openViewer(viewer.list, viewer.k + (e.key === 'ArrowRight' ? 1 : -1), viewer.title); return; }
    if (e.key === 'Escape' && $('#navigation')?.classList.contains('open')) $('.menu-toggle')?.click();
  });
  document.addEventListener('visibilitychange', () => shows.forEach(playActive));

  /* ---------- Forms ----------
     With a server endpoint the request is posted there. Until one exists, the visitor's message
     is handed to their own email or WhatsApp app, addressed to the studio, so nothing is lost. */
  function summary(type, v) {
    const lines = type === 'lead' ? ['Please send me the free Fashion Illustration book sample.', `Email: ${v.email}`]
      : [`${v.kind === 'mentorship' ? 'Mentorship request' : 'Project enquiry'} from ${v.name}`, `Email: ${v.email}`, `Focus: ${v.interest}`, '', v.message, v.budget && `Budget: ${v.budget}`, v.timeline && `Timeline: ${v.timeline}`, v.reference && `Reference: ${v.reference}`].filter(x => x !== undefined && x !== '');
    const subject = type === 'lead' ? 'Book sample request' : v.kind === 'mentorship' ? 'Mentorship request' : 'Project enquiry';
    return {subject: `${subject}, Nasara Studios`, body: lines.join('\n')};
  }
  async function deliver(type, payload) {
    const endpoint = C.endpoints[type];
    if (endpoint) {
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 15000);
      try {
        const res = await fetch(endpoint, {method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'same-origin', signal: ctl.signal, body: JSON.stringify(payload)});
        if (!res.ok) throw new Error('We couldn’t complete that just now. Please try again.');
        return {server: await res.json().catch(() => ({}))};
      } catch (err) { throw err.name === 'AbortError' ? new Error('The connection took too long. Your details are still here, please try again.') : err; }
      finally { clearTimeout(t); }
    }
    if (type === 'lead' && C.sampleUrl) return {sample: true};
    const {subject, body} = summary(type, payload);
    const viaWhatsApp = () => { open(`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(`${subject}\n\n${body}`)}`, '_blank', 'noopener'); return {handoff: 'WhatsApp'}; };
    const viaEmail = () => { location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; return {handoff: 'your email app'}; };
    if (contact.whatsapp && (matchMedia('(pointer: coarse)').matches || !contact.email)) return viaWhatsApp();
    if (contact.email) return viaEmail();
    throw new Error(contact.instagram ? 'IG' : 'We couldn’t send this just now. Please try again shortly.');
  }
  document.addEventListener('submit', async e => {
    const form = e.target.closest('form[data-form]'); if (!form) return; e.preventDefault();
    if (form.dataset.busy || !form.reportValidity()) return;
    const type = form.dataset.form, values = Object.fromEntries(new FormData(form));
    const payload = {...values, marketing: values.marketing === 'on', source: route, kind: form.dataset.kind || type};
    const status = form.querySelector('.form-status');
    const buttons = [...form.querySelectorAll('[type="submit"]'), ...(form.id ? $$(`[form="${form.id}"]`) : [])];
    form.dataset.busy = 'true'; form.setAttribute('aria-busy', 'true'); buttons.forEach(b => b.disabled = true); status.className = 'form-status'; status.textContent = 'One moment…';
    try {
      const r = await deliver(type, payload);
      status.classList.add('ok');
      if (r.sample) { status.innerHTML = `Here’s your sample. <a class="link" href="${esc(C.sampleUrl)}" target="_blank" rel="noopener">Open the sample ${arrow}</a>`; return; }
      if (r.handoff) { status.textContent = `Your message is ready in ${r.handoff}. Press send and we’ll be in touch.`; return; }
      status.textContent = type === 'lead' ? 'Your sample is on its way. Check your inbox.' : 'Thank you. Your message has been received.';
      form.reset();
    } catch (err) {
      status.classList.add('error');
      if (err.message === 'IG') status.innerHTML = `We couldn’t send this from here. Please <a class="link" href="${esc(contact.instagram)}" target="_blank" rel="noopener">message us on Instagram</a>.`;
      else status.textContent = err.message || 'Something went wrong. Please try again.';
    } finally { delete form.dataset.busy; form.removeAttribute('aria-busy'); buttons.forEach(b => b.disabled = false); }
  });

  /* ---------- Preloader: running stitch ----------
     A small needle weaves across the word leaving a running stitch; NASARA appears as stitched
     outlines behind it, the stitches pull tight, the letters fill, STUDIOS slides in. Then the whole
     lockup eases up into the header while the ivory veil lifts. */
  const NS = 'http://www.w3.org/2000/svg';
  function bez(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = t => ((ax * t + bx) * t + cx) * t, sy = t => ((ay * t + by) * t + cy) * t, dx = t => (3 * ax * t + 2 * bx) * t + cx;
    return x => { let t = x; for (let i = 0; i < 6; i++) { const e = sx(t) - x, d = dx(t); if (Math.abs(e) < 1e-4 || !d) break; t -= e / d; } return sy(Math.min(1, Math.max(0, t))); };
  }
  const inOut = bez(.65, 0, .35, 1);
  const tween = (from, to, {duration, delay = 0, ease = inOut}, apply) => { apply(from); return new Promise(done => setTimeout(() => { const t0 = performance.now(), keys = Object.keys(to); const step = now => { const p = Math.min(1, (now - t0) / duration), e = ease(p), v = {}; keys.forEach(k => v[k] = from[k] + (to[k] - from[k]) * e); apply(v); p < 1 ? requestAnimationFrame(step) : done(); }; requestAnimationFrame(step); }, delay)); };
  const fade = (el, frames, opts) => el.animate(frames, {fill: 'both', easing: 'cubic-bezier(.65,0,.35,1)', ...opts});
  const NEEDLE = .6;  // needle scale: kept small so it guides the eye without competing with the word

  function buildMark(stage) {
    stage.innerHTML = `<svg><defs><linearGradient id="pl-steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9c96a8"/><stop offset=".45" stop-color="#4b4458"/><stop offset="1" stop-color="#282235"/></linearGradient>
      <mask id="pl-sweep" maskUnits="userSpaceOnUse" x="-300" y="-300" width="3000" height="600"><rect id="pl-sweep-rect" x="-60" y="-140" width="0" height="260" fill="#fff"/></mask></defs>
      <g id="pl-threads"></g><g id="pl-letters"></g>
      <g class="pl-needle" id="pl-needle"><path d="M -9 0 C -9 -3.8, -3 -4.2, 6 -3 L 104 -0.6 L 112 0 L 104 0.6 L 6 3 C -3 4.2, -9 3.8, -9 0 Z" fill="url(#pl-steel)"/><ellipse cx="0" cy="0" rx="4.6" ry="1.3" fill="#f7f2e9"/></g></svg>
      <div class="pl-studios"><span>STUDIOS</span></div>`;
    const svg = $('svg', stage), g = $('#pl-letters', svg), letters = []; let x = 0;
    for (const ch of 'NASARA') { const t = document.createElementNS(NS, 'text'); t.textContent = ch; t.setAttribute('x', x); t.setAttribute('y', 0); g.append(t); const w = t.getComputedTextLength(); letters.push(t); x += w + 6; }
    const W = x - 6;
    svg.setAttribute('viewBox', `0 -76 ${W} 90`); svg.style.width = `${W / 100}em`; svg.style.height = '.9em';
    return {svg, letters, W};
  }
  function stitchIn({letters, W}) {
    const mid = -32, waves = 7, amp = 9, x0 = -40, span = W + 80, needle = $('#pl-needle'), sweep = $('#pl-sweep-rect');
    let d = `M ${x0} ${mid}`;
    for (let i = 0; i < waves; i++) { const a = x0 + span * i / waves, b = x0 + span * (i + 1) / waves; d += ` Q ${(a + b) / 2} ${mid + (i % 2 ? amp : -amp) * 2}, ${b} ${mid}`; }
    const stitch = document.createElementNS(NS, 'path'); stitch.setAttribute('d', d); stitch.setAttribute('class', 'pl-thread'); stitch.setAttribute('mask', 'url(#pl-sweep)'); stitch.style.strokeDasharray = '7 6'; $('#pl-threads').append(stitch);
    $('#pl-letters').setAttribute('mask', 'url(#pl-sweep)');
    letters.forEach(t => { t.style.strokeOpacity = 1; t.style.strokeDasharray = '5 3.4'; });
    const travel = 1900, lead = 300;
    tween({w: 0}, {w: span + 40}, {duration: travel, delay: lead}, v => sweep.setAttribute('width', v.w));
    tween({p: 0}, {p: 1}, {duration: travel, delay: lead}, v => {
      const x = x0 + span * v.p, ph = v.p * waves * Math.PI;
      needle.setAttribute('transform', `translate(${x - 112 * NEEDLE + 3} ${mid - Math.sin(ph) * amp}) rotate(${Math.cos(ph) * -14}) scale(${NEEDLE})`);
      needle.style.opacity = Math.min(1, v.p * 12, (1 - v.p) * 10);
    });
    setTimeout(() => { letters.forEach(t => fade(t, [{strokeDasharray: '5 3.4'}, {strokeDasharray: '5 0'}], {duration: 650})); fade(stitch, [{opacity: 1}, {opacity: 0}], {duration: 700}); }, 2300);
    setTimeout(() => letters.forEach((t, i) => fade(t, [{fillOpacity: 0, strokeOpacity: 1}, {fillOpacity: 1, strokeOpacity: 0}], {duration: 700, delay: i * 50})), 2750);
    setTimeout(() => fade($('.pl-studios span'), [{opacity: 0, transform: 'translateX(-60%)', letterSpacing: '1.3em'}, {opacity: 1, transform: 'none', letterSpacing: '.86em'}], {duration: 900, easing: 'cubic-bezier(.16,1,.3,1)'}), 3050);
    return 4000;
  }
  function settled({letters}) { letters.forEach(t => { t.style.fillOpacity = 1; t.style.strokeOpacity = 0; }); $('.pl-studios span').style.opacity = 1; }

  async function intro() {
    const pl = $('#preloader'), stage = $('#pl-stage'), veil = $('.pl-veil');
    let done = false;
    const finish = () => { html.classList.remove('intro', 'mark-flying'); pl.classList.add('gone'); try { sessionStorage.setItem('nasara-intro', '1'); } catch {} };
    if (capture) return finish();
    await Promise.race([document.fonts?.load('700 100px "Cormorant Garamond"') || Promise.resolve(), sleep(1800)]).catch(() => {});
    const mark = buildMark(stage);
    const exit = async () => {
      if (done) return; done = true;
      if (motion.matches) return finish();
      pl.classList.add('leaving'); settled(mark);
      html.classList.add('mark-flying'); html.classList.remove('intro');
      const target = $('#header .lockup-word').getBoundingClientRect(), word = mark.svg.getBoundingClientRect(), box = stage.getBoundingClientRect();
      const k = target.width / word.width, capsY = word.top + word.height * .494;
      const cx = box.left + box.width / 2, cy = box.top + box.height / 2;
      const dx = (target.left + target.width / 2) - cx, dy = (target.top + target.height / 2) - (cy + (capsY - cy) * k);
      const flight = stage.animate([{transform: 'none', color: getComputedStyle(stage).color}, {transform: `translate(${dx}px, ${dy}px) scale(${k})`, color: getComputedStyle($('#header')).color}], {duration: 1400, easing: 'cubic-bezier(.45,.05,.2,1)', fill: 'forwards'});
      veil.animate([{clipPath: 'inset(0 0 0 0)'}, {clipPath: 'inset(0 0 100% 0)'}], {duration: 1250, delay: 200, easing: 'cubic-bezier(.7,0,.25,1)', fill: 'forwards'});
      await Promise.race([flight.finished, sleep(1800)]);
      html.classList.remove('mark-flying');
      await sleep(40);
      finish();
    };
    $('#skip-loader').onclick = exit;
    if (motion.matches) { settled(mark); await sleep(400); return exit(); }
    const length = stitchIn(mark);
    const media = $$('.slide.is-active img, .slide.is-active video', main).slice(0, 3);
    const ready = Promise.allSettled(media.map(m => m.tagName === 'IMG' ? (m.decode ? m.decode() : Promise.resolve()) : new Promise(r => { if (m.readyState >= 2) r(); else { m.addEventListener('loadeddata', r, {once: true}); m.addEventListener('error', r, {once: true}); } })));
    await Promise.all([sleep(length + 250), Promise.race([ready, sleep(5000)])]);
    exit();
  }

  footer(); route = resolve(); render(); intro();
})();
