// Generates a standalone, self-contained HTML product catalog (images embedded as base64).
// Meant to be hosted SEPARATELY from the main site (so it stays up if this site goes down).
//
// Usage:
//   node --env-file=.env scripts/generate-catalog.mjs
//
// Reads products from TURSO_DATABASE_URL (production) if set, otherwise falls back to
// the local prisma/dev.db. Image bytes always come from the local public/ folder, so make
// sure your local repo is up to date (git pull) before regenerating after adding a product
// with a newly-pushed image.

import { createClient } from '@libsql/client';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.join(import.meta.dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUT_DIR = path.join(ROOT, 'catalog-export');
const HTML_PATH = path.join(OUT_DIR, 'CaptainMarket-Catalogue.html');
const INDEX_PATH = path.join(OUT_DIR, 'index.html'); // served at the catalog site's root by Netlify

fs.mkdirSync(OUT_DIR, { recursive: true });

const dbUrl = process.env.TURSO_DATABASE_URL ?? `file:${path.join(ROOT, 'prisma', 'dev.db')}`;
console.log('Reading products from:', dbUrl.startsWith('file:') ? dbUrl : dbUrl.replace(/\/\/.*@/, '//***@'));
const client = createClient({ url: dbUrl, authToken: process.env.TURSO_AUTH_TOKEN });

const { rows } = await client.execute(`
  SELECT id, title, slug
  FROM Product
  WHERE status = 'ACTIVE'
  ORDER BY title
`);

const { rows: imageRows } = await client.execute(`
  SELECT pi.productId, pi.url, pi.position
  FROM ProductImage pi
  JOIN Product p ON p.id = pi.productId
  WHERE p.status = 'ACTIVE'
  ORDER BY pi.productId, pi.position
`);

// Every real category from the site (mirrors the live nav 1:1 — a product can, and does,
// show up under several categories here, exactly like on the deployed store).
const { rows: allCategories } = await client.execute(`
  SELECT id, name, slug
  FROM Category
  WHERE slug != 'frontpage'
  ORDER BY createdAt ASC
`);

const { rows: pcRows } = await client.execute(`
  SELECT pc.productId as pid, pc.categoryId as cid
  FROM ProductCategory pc
  JOIN Product p ON p.id = pc.productId
  WHERE p.status = 'ACTIVE'
`);

const imagesByProduct = new Map();
for (const r of imageRows) {
  if (!imagesByProduct.has(r.productId)) imagesByProduct.set(r.productId, []);
  imagesByProduct.get(r.productId).push(r.url);
}

const productsByCategory = new Map();
for (const r of pcRows) {
  if (!productsByCategory.has(r.cid)) productsByCategory.set(r.cid, []);
  productsByCategory.get(r.cid).push(r.pid);
}
const productById = new Map(rows.map(p => [p.id, p]));

// Cover photo file names that happen to match a category slug (public/categories/<slug>.png).
// Categories without a matching file fall back to their first product's photo as a banner.
const CATEGORIES = allCategories.map(c => ({
  slug: c.slug,
  label: c.name,
  cover: `${c.slug}.png`,
  products: (productsByCategory.get(c.id) || []).map(pid => productById.get(pid)).filter(Boolean),
}));

function cleanTitle(title) {
  return title.replace(/\s*\(\+\d+\s*OPTIONS?\)\s*$/i, '').trim();
}

const buckets = new Map(CATEGORIES.map(c => [c.slug, c.products]));

console.log('Category counts:');
for (const c of CATEGORIES) console.log(' -', c.label, c.products.length);

async function toDataUri(srcPath, maxWidth, quality = 76) {
  const buf = await sharp(srcPath)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .flatten({ background: '#111111' })
    .jpeg({ quality })
    .toBuffer();
  return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

const productImages = new Map();
for (const p of rows) {
  const urls = imagesByProduct.get(p.id) || [];
  const dataUris = [];
  for (const url of urls) {
    const src = path.join(PUBLIC_DIR, url.replace(/^\//, ''));
    if (!fs.existsSync(src)) { console.log('MISSING (pull latest repo?):', src); continue; }
    dataUris.push(await toDataUri(src, 640, 72));
  }
  productImages.set(p.id, dataUris);
}

for (const c of CATEGORIES) {
  const src = path.join(PUBLIC_DIR, 'categories', c.cover);
  if (fs.existsSync(src)) {
    c.coverDataUri = await toDataUri(src, 900, 72);
  } else if (c.products[0]) {
    // No dedicated cover art for this category — use its first product's photo instead.
    c.coverDataUri = (productImages.get(c.products[0].id) || [])[0] || null;
  }
}

const heroSrc = path.join(PUBLIC_DIR, 'hero-cover.png');
const heroDataUri = fs.existsSync(heroSrc) ? await toDataUri(heroSrc, 1400, 70) : null;

const activeCats = CATEGORIES;

const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// A product can appear on several category pages (exactly like the live site's collections).
// Its image bytes are embedded exactly once, in the GALLERIES object below — cards on every
// page just reference the product id and get their thumbnail filled in by JS at load time,
// instead of re-embedding the same base64 data once per appearance.
function productCard(p) {
  const imgs = productImages.get(p.id) || [];
  return `<figure class="card" onclick="openLightbox('${p.id}')">
    <div class="card-img"><img data-pid="${p.id}" alt="${escapeHtml(cleanTitle(p.title))}" loading="lazy"></div>
    <figcaption>${escapeHtml(cleanTitle(p.title))}${imgs.length > 1 ? `<span class="count-badge">${imgs.length} photos</span>` : ''}</figcaption>
  </figure>`;
}

function categorySectionHtml(c, index) {
  const products = buckets.get(c.slug) || [];
  const prev = activeCats[index - 1];
  const next = activeCats[index + 1];
  return `<section class="page" id="page-${c.slug}" data-slug="${c.slug}">
    <div class="page-banner" style="${c.coverDataUri ? `background-image:url('${c.coverDataUri}')` : ''}">
      <div class="page-banner-overlay">
        <h2>${escapeHtml(c.label)}</h2>
        <p>${products.length} produit${products.length > 1 ? 's' : ''}</p>
      </div>
    </div>
    <div class="grid">
      ${products.length ? products.map(productCard).join('\n') : '<p class="empty-state">Bientôt disponible — aucun produit dans cette catégorie pour l\'instant.</p>'}
    </div>
    <nav class="pager">
      ${prev ? `<button onclick="showPage('${prev.slug}')">&larr; ${escapeHtml(prev.label)}</button>` : '<span></span>'}
      <button class="pager-home" onclick="showPage('home')">Accueil</button>
      ${next ? `<button onclick="showPage('${next.slug}')">${escapeHtml(next.label)} &rarr;</button>` : '<span></span>'}
    </nav>
  </section>`;
}

const navLinksHtml = activeCats.map(c => {
  const count = (buckets.get(c.slug) || []).length;
  return `<button class="nav-link${count === 0 ? ' nav-link-empty' : ''}" data-slug="${c.slug}" onclick="showPage('${c.slug}')">
    <span>${escapeHtml(c.label)}</span>
    <span class="nav-link-count">${count || ''}</span>
  </button>`;
}).join('\n');

const homeCardsHtml = activeCats.map(c => {
  const count = (buckets.get(c.slug) || []).length;
  return `<button class="home-card${count === 0 ? ' home-card-empty' : ''}" onclick="showPage('${c.slug}')" style="${c.coverDataUri ? `background-image:url('${c.coverDataUri}')` : ''}">
    <span class="home-card-overlay">
      <strong>${escapeHtml(c.label)}</strong>
      <small>${count > 0 ? count + ' produit' + (count > 1 ? 's' : '') : 'Bientôt disponible'}</small>
    </span>
  </button>`;
}).join('\n');

const sectionsHtml = activeCats.map((c, i) => categorySectionHtml(c, i)).join('\n');

const galleries = {};
for (const p of rows) {
  galleries[p.id] = { title: cleanTitle(p.title), images: productImages.get(p.id) || [] };
}
const galleriesJson = JSON.stringify(galleries);

const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CaptainMarket Catalogue</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#0c0a0b; --bg-elev:#171315; --card:#1d1719; --border:#332a2c;
    --text:#f3efe9; --text-dim:#a89e9a; --accent:#ffffff;
    --font-display:'Anton', 'Arial Narrow Bold', Impact, sans-serif;
    --font-body:'Inter', 'Helvetica Neue', Arial, sans-serif;
  }
  *{box-sizing:border-box;}
  html,body{margin:0;padding:0;background:var(--bg);color:var(--text);font-family:var(--font-body);}
  h1,h2,h3{margin:0;font-family:var(--font-display);font-weight:400;letter-spacing:.01em;text-wrap:balance;}
  button{font-family:inherit;cursor:pointer;}
  a,button{outline-offset:2px;}
  a:focus-visible,button:focus-visible{outline:2px solid var(--text);border-radius:4px;}

  header.hero{
    position:relative; min-height:46vh; display:flex; align-items:flex-end;
    background:${heroDataUri ? `url('${heroDataUri}') center/cover no-repeat` : '#111'};
  }
  header.hero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,.85) 90%);}
  .hero-inner{position:relative;z-index:1;padding:32px clamp(16px,5vw,48px);}
  .hero-inner h1{font-size:clamp(28px,5vw,48px);font-weight:800;}
  .hero-inner p{color:var(--text-dim);margin-top:8px;font-size:14px;}

  .topbar{
    position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:14px;
    background:rgba(12,10,11,.92);backdrop-filter:blur(6px);
    padding:14px clamp(16px,5vw,48px);border-bottom:1px solid var(--border);
  }
  .topbar-brand{font-family:var(--font-display);font-size:15px;letter-spacing:.03em;color:var(--text);}
  .menu-toggle{
    display:flex;flex-direction:column;justify-content:center;gap:4px;
    width:34px;height:30px;background:transparent;border:1px solid var(--border);border-radius:8px;padding:0 7px;
  }
  .menu-toggle span{display:block;width:100%;height:2px;background:var(--text);border-radius:2px;}
  .menu-toggle:hover{border-color:#666;}

  #sidebar-backdrop{
    position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:29;
    opacity:0;pointer-events:none;transition:opacity .2s ease;
  }
  #sidebar-backdrop.open{opacity:1;pointer-events:auto;}

  #sidebar{
    position:fixed;top:0;left:0;bottom:0;width:280px;max-width:82vw;z-index:30;
    background:var(--bg-elev);border-right:1px solid var(--border);
    transform:translateX(-100%);transition:transform .25s ease;
    display:flex;flex-direction:column;
  }
  #sidebar.open{transform:translateX(0);}
  .sidebar-head{
    display:flex;align-items:center;justify-content:space-between;
    padding:18px 20px;border-bottom:1px solid var(--border);flex:0 0 auto;
  }
  .sidebar-title{font-family:var(--font-display);font-size:15px;color:var(--text);letter-spacing:.02em;}
  .sidebar-close{background:none;border:none;color:var(--text-dim);font-size:24px;line-height:1;padding:4px;}
  .sidebar-close:hover{color:var(--text);}
  .sidebar-nav{overflow-y:auto;padding:8px 0 24px;}
  .nav-link{
    display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;
    background:transparent;border:none;border-left:3px solid transparent;
    color:var(--text-dim);text-align:left;font-size:13.5px;padding:12px 20px;transition:.15s;
  }
  .nav-link:hover{color:var(--text);background:rgba(255,255,255,.03);}
  .nav-link.active{color:var(--text);border-left-color:var(--accent);background:rgba(255,255,255,.05);font-weight:600;}
  .nav-link-count{color:var(--text-dim);font-size:11.5px;font-variant-numeric:tabular-nums;}
  .nav-link-empty .nav-link-count{visibility:hidden;}

  main{padding:0 clamp(16px,5vw,48px) 60px;}

  #page-home{padding-top:32px;}
  .home-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:18px;margin-top:20px;}
  .home-card{
    position:relative;height:180px;border-radius:12px;border:1px solid var(--border);
    background:#1a1a1c center/cover no-repeat;overflow:hidden;padding:0;
  }
  .home-card-overlay{
    position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;
    padding:16px;background:linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,.8) 100%);
    text-align:left;color:#fff;
  }
  .home-card-overlay strong{font-size:16px;font-family:var(--font-display);letter-spacing:.01em;}
  .home-card-overlay small{color:var(--text-dim);margin-top:4px;}
  .home-card-empty{opacity:.55;}
  .home-card-empty:hover{opacity:.8;}

  .page{display:none;padding-top:0;}
  .page.visible{display:block;}
  .page-banner{
    position:relative;height:180px;border-radius:14px;margin:24px 0 24px;overflow:hidden;
    background:#161618 center/cover no-repeat;border:1px solid var(--border);
  }
  .page-banner-overlay{
    position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;
    padding:0 28px;background:linear-gradient(90deg, rgba(0,0,0,.75) 0%, rgba(0,0,0,.25) 70%);
  }
  .page-banner-overlay h2{font-size:clamp(20px,3.5vw,30px);}
  .page-banner-overlay p{color:var(--text-dim);margin-top:6px;font-size:13px;}

  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:18px;}
  .card{margin:0;background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden;cursor:pointer;transition:.15s;}
  .card:hover{border-color:#555;transform:translateY(-2px);}
  .card-img{aspect-ratio:1/1;background:#101012;display:flex;align-items:center;justify-content:center;}
  .card-img img{width:100%;height:100%;object-fit:contain;}
  .card figcaption{padding:10px 12px 14px;font-size:12.5px;text-align:center;color:var(--text);}
  .card figcaption .count-badge{display:block;margin-top:4px;font-size:10.5px;color:var(--text-dim);}
  .empty-state{grid-column:1/-1;color:var(--text-dim);font-size:13.5px;padding:40px 0;text-align:center;}

  nav.pager{display:flex;justify-content:space-between;align-items:center;margin:36px 0 10px;gap:10px;}
  nav.pager button{background:var(--bg-elev);border:1px solid var(--border);color:var(--text);padding:10px 16px;border-radius:8px;font-size:13px;}
  nav.pager button:hover{border-color:#666;}
  nav.pager .pager-home{color:var(--text-dim);}

  footer{padding:24px clamp(16px,5vw,48px) 40px;color:var(--text-dim);font-size:12px;border-top:1px solid var(--border);margin-top:20px;}

  #lightbox{position:fixed;inset:0;background:rgba(0,0,0,.92);display:none;align-items:center;justify-content:center;flex-direction:column;z-index:100;padding:24px;}
  #lightbox.visible{display:flex;}
  #lightbox img{max-width:min(86vw,700px);max-height:66vh;object-fit:contain;border-radius:8px;}
  #lightbox .lb-title{color:#fff;margin-top:16px;font-size:15px;}
  #lightbox .lb-counter{color:var(--text-dim);margin-top:6px;font-size:12px;}
  #lightbox .lb-close{position:absolute;top:20px;right:28px;color:#fff;font-size:28px;background:none;border:none;z-index:2;}
  #lightbox .lb-arrow{
    position:absolute;top:50%;transform:translateY(-50%);color:#fff;font-size:36px;line-height:1;
    background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);border-radius:50%;
    width:52px;height:52px;align-items:center;justify-content:center;display:none;z-index:2;
  }
  #lightbox .lb-arrow:hover{background:rgba(255,255,255,.18);}
  #lightbox .lb-prev{left:16px;}
  #lightbox .lb-next{right:16px;}
  @media (max-width:640px){
    #lightbox .lb-arrow{width:42px;height:42px;font-size:28px;}
    #lightbox .lb-prev{left:6px;}
    #lightbox .lb-next{right:6px;}
  }

  @media (max-width:520px){
    .grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;}
    .home-grid{grid-template-columns:repeat(auto-fill,minmax(160px,1fr));}
  }
</style>
</head>
<body>

<div id="sidebar-backdrop" onclick="closeSidebar()"></div>

<aside id="sidebar">
  <div class="sidebar-head">
    <span class="sidebar-title">Catégories</span>
    <button class="sidebar-close" onclick="closeSidebar()" aria-label="Fermer le menu">&times;</button>
  </div>
  <nav class="sidebar-nav">
    <button class="nav-link active" data-slug="home" onclick="showPage('home')">
      <span>Accueil</span><span class="nav-link-count"></span>
    </button>
    ${navLinksHtml}
  </nav>
</aside>

<div class="topbar">
  <button class="menu-toggle" onclick="openSidebar()" aria-label="Ouvrir le menu">
    <span></span><span></span><span></span>
  </button>
  <span class="topbar-brand">CAPTAINMARKET</span>
</div>

<header class="hero">
  <div class="hero-inner">
    <h1>CAPTAINMARKET</h1>
    <p>Catalogue produits — version de secours &nbsp;•&nbsp; généré le ${today} &nbsp;•&nbsp; à consulter si le site n'est pas disponible</p>
  </div>
</header>

<main>
  <section class="page visible" id="page-home">
    <div class="home-grid">
      ${homeCardsHtml}
    </div>
  </section>

  ${sectionsHtml}
</main>

<footer>CaptainMarket — catalogue statique, aucune connexion requise. Fichier autonome : fonctionne même hors ligne.</footer>

<div id="lightbox" onclick="closeLightbox(event)">
  <button class="lb-close" onclick="closeLightbox(event)">&times;</button>
  <button class="lb-arrow lb-prev" onclick="stepLightbox(event,-1)">&#8249;</button>
  <img id="lightbox-img" src="" alt="">
  <button class="lb-arrow lb-next" onclick="stepLightbox(event,1)">&#8250;</button>
  <div class="lb-title" id="lightbox-title"></div>
  <div class="lb-counter" id="lightbox-counter"></div>
</div>

<script>
  var GALLERIES = ${galleriesJson};
  var currentGallery = null;
  var currentIndex = 0;

  document.querySelectorAll('.card-img img[data-pid]').forEach(function(img){
    var g = GALLERIES[img.dataset.pid];
    if(g && g.images[0]) img.src = g.images[0];
  });

  function showPage(slug){
    document.querySelectorAll('.page').forEach(function(el){ el.classList.remove('visible'); });
    document.querySelectorAll('.nav-link').forEach(function(el){ el.classList.remove('active'); });
    var target = document.getElementById('page-' + slug);
    if(target) target.classList.add('visible');
    var link = document.querySelector('.nav-link[data-slug="' + slug + '"]');
    if(link) link.classList.add('active');
    window.scrollTo({top:0, behavior:'instant'});
    if(history.replaceState) history.replaceState(null, '', '#' + slug);
    closeSidebar();
  }
  function openSidebar(){
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebar-backdrop').classList.add('open');
  }
  function closeSidebar(){
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-backdrop').classList.remove('open');
  }

  function renderLightbox(){
    if(!currentGallery) return;
    document.getElementById('lightbox-img').src = currentGallery.images[currentIndex];
    document.getElementById('lightbox-title').textContent = currentGallery.title;
    var multi = currentGallery.images.length > 1;
    document.getElementById('lightbox-counter').textContent = multi ? (currentIndex + 1) + ' / ' + currentGallery.images.length : '';
    document.querySelector('.lb-prev').style.display = multi ? 'flex' : 'none';
    document.querySelector('.lb-next').style.display = multi ? 'flex' : 'none';
  }
  function openLightbox(productId){
    currentGallery = GALLERIES[productId];
    currentIndex = 0;
    renderLightbox();
    document.getElementById('lightbox').classList.add('visible');
  }
  function stepLightbox(e, dir){
    e.stopPropagation();
    if(!currentGallery) return;
    var n = currentGallery.images.length;
    currentIndex = (currentIndex + dir + n) % n;
    renderLightbox();
  }
  function closeLightbox(e){
    if(e.target.id === 'lightbox' || e.target.classList.contains('lb-close')){
      document.getElementById('lightbox').classList.remove('visible');
    }
  }
  document.addEventListener('keydown', function(e){
    var lb = document.getElementById('lightbox');
    if(lb.classList.contains('visible')){
      if(e.key === 'Escape') lb.classList.remove('visible');
      if(e.key === 'ArrowLeft') stepLightbox(e, -1);
      if(e.key === 'ArrowRight') stepLightbox(e, 1);
      return;
    }
    if(e.key === 'Escape') closeSidebar();
  });
  (function(){
    var hash = window.location.hash.replace('#','');
    if(hash) showPage(hash);
  })();
</script>

</body>
</html>`;

fs.writeFileSync(HTML_PATH, html, 'utf-8');
fs.writeFileSync(INDEX_PATH, html, 'utf-8');
console.log('HTML written to', HTML_PATH, 'and', INDEX_PATH);
console.log('Size:', (fs.statSync(HTML_PATH).size / 1024 / 1024).toFixed(2), 'MB');

client.close();
