// LockHabit Journal — data loader, filters, renderer (vanilla, fast)
const $ = (s, el=document)=> el.querySelector(s);
const $$ = (s, el=document)=> Array.from(el.querySelectorAll(s));

const POSTS_INDEX = '/blog/posts/posts.json';
const IMG_FALLBACK = '/blog/images/placeholder.jpg';

// naive markdown -> html (headings, lists, code, inline)
function mdToHtml(src){
  // code blocks
  src = src.replace(/```([\s\S]*?)```/g, (_,code)=> `<pre><code>${escapeHtml(code)}</code></pre>`);
  // headings
  src = src.replace(/^### (.*)$/gm,'<h3>$1</h3>');
  src = src.replace(/^## (.*)$/gm,'<h2>$1</h2>');
  src = src.replace(/^# (.*)$/gm,'<h1>$1</h1>');
  // blockquote
  src = src.replace(/^\> (.*)$/gm,'<blockquote>$1</blockquote>');
  // lists
  src = src.replace(/^\- (.*)$/gm,'<ul><li>$1</li></ul>');
  src = src.replace(/^\d+\. (.*)$/gm,'<ol><li>$1</li></ol>');
  // paragraphs
  src = src.replace(/^(?!<h\d|<ul|<ol|<pre|<blockquote)(.+)$/gm,'<p>$1</p>');
  // bold/italic/code
  src = src.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  src = src.replace(/\*(.+?)\*/g,'<em>$1</em>');
  src = src.replace(/`(.+?)`/g,'<code>$1</code>');
  // merge consecutive <ul> and <ol>
  src = src.replace(/<\/ul>\s*<ul>/g,'').replace(/<\/ol>\s*<ol>/g,'');
  return src;
}

function escapeHtml(s){ return s.replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

// ------------ Home (index)
async function initHome(){
  if (!location.pathname.endsWith('/blog/') && !location.pathname.endsWith('/blog/index.html')) return;

  const data = await fetch(POSTS_INDEX).then(r=>r.json()).catch(()=>[]);
  if(!data.length) return;

  // Sort by date desc
  data.sort((a,b)=> new Date(b.date) - new Date(a.date));

  // Hero 3
  const hero = data.slice(0,3);
  const heroGrid = $('#heroGrid');
  heroGrid.innerHTML = hero.map(x=> heroCard(x)).join('');

  // Grid
  const grid = $('#postGrid');
  grid.innerHTML = data.slice(3).map(postCard).join('');

  // Editor’s picks = most recent from distinct categories
  const picks = [];
  const seen = new Set();
  for(const p of data){
    if(!seen.has(p.category)){ picks.push(p); seen.add(p.category); }
    if(picks.length>=4) break;
  }
  $('#editorPicks .mini-list').innerHTML = picks.map(p=>`
    <a class="mini-item" href="/blog/post.html?p=${encodeURIComponent(p.slug)}">${p.title}</a>
  `).join('');

  // Popular tags
  const tagCounts = {};
  data.forEach(p=> (p.tags||[]).forEach(t=> tagCounts[t]=(tagCounts[t]||0)+1 ));
  const topTags = Object.entries(tagCounts).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([t])=>t);
  $('#popularTags .tags-wrap').innerHTML = topTags.map(t=> `<a href="#" data-tag="${t}" class="tagchip">${t}</a>`).join('');

  // Filters
  $$('.chip').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      $$('.chip').forEach(b=>b.setAttribute('aria-pressed','false'));
      btn.setAttribute('aria-pressed','true');
      const f = btn.dataset.filter;
      const list = f==='all' ? data : data.filter(p=> p.category===f);
      grid.innerHTML = list.slice(3).map(postCard).join('');
      window.scrollTo({ top: heroGrid.offsetTop + heroGrid.offsetHeight - 50, behavior: 'smooth' });
    });
  });

  // Tag filter clicks
  $$('#popularTags .tagchip').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const tag = a.dataset.tag;
      const list = data.filter(p=> (p.tags||[]).includes(tag));
      grid.innerHTML = list.map(postCard).join('');
      $$('.chip').forEach(b=>b.setAttribute('aria-pressed','false'));
    });
  });

  // Fire ads
  try{ (adsbygoogle=window.adsbygoogle||[]).push({}); }catch(_){}
}

function heroCard(p){
  const img = p.hero || IMG_FALLBACK;
  return `
  <a class="hero-card" href="/blog/post.html?p=${encodeURIComponent(p.slug)}">
    <div class="img" style="background-image:url('${img}')"></div>
    <div class="meta">
      <span class="tag">${p.category}</span>
      <h2>${escapeHtml(p.title)}</h2>
      <p>${escapeHtml(p.dek)}</p>
      <div class="by">${escapeHtml(p.author||'LockHabit')} • ${fmtDate(p.date)} • ${p.read||estRead(p)}</div>
    </div>
  </a>`;
}

function postCard(p){
  const img = p.hero || IMG_FALLBACK;
  return `
  <article class="card post-card">
    <a href="/blog/post.html?p=${encodeURIComponent(p.slug)}"><div class="thumb" style="background-image:url('${img}')"></div></a>
    <div class="info">
      <span class="tag">${p.category}</span>
      <a href="/blog/post.html?p=${encodeURIComponent(p.slug)}"><h4>${escapeHtml(p.title)}</h4></a>
      <p>${escapeHtml(p.dek)}</p>
      <div class="meta">${escapeHtml(p.author||'LockHabit')} • ${fmtDate(p.date)} • ${p.read||estRead(p)}</div>
    </div>
  </article>`;
}

// ------------ Reader (post.html)
async function initPost(){
  if (!location.pathname.endsWith('/blog/post.html')) return;
  const params = new URLSearchParams(location.search);
  const slug = params.get('p');
  const data = await fetch(POSTS_INDEX).then(r=>r.json()).catch(()=>[]);
  const idx = data.findIndex(p=> p.slug===slug);
  const post = data[idx];

  if(!post){
    $('#posthead').innerHTML = `<p>Article not found.</p>`;
    return;
  }

  // Head & OG
  $('#pgtitle').textContent = `${post.title} — LockHabit Journal`;
  $('#pgdesc').setAttribute('content', post.dek);
  $('#ogt').setAttribute('content', post.title);
  $('#ogd').setAttribute('content', post.dek);
  $('#pgurl').setAttribute('href', location.href);
  if(post.hero) $('#ogi').setAttribute('content', post.hero);

  // Header
  $('#posthead').innerHTML = `
    <span class="tag">${post.category}</span>
    <h1>${escapeHtml(post.title)}</h1>
    <div class="byline">${escapeHtml(post.author||'LockHabit')} • ${fmtDate(post.date)} • ${post.read||estRead(post)}</div>
  `;

  // Load markdown
  const mdPath = `/blog/posts/${post.slug}.md`;
  const md = await fetch(mdPath).then(r=> r.ok ? r.text(): '# Missing Content\nThis article is coming soon.');
  $('#content').innerHTML = mdToHtml(md);

  // Prev/next
  const nav = $('#postNav');
  const prev = data[idx-1], next = data[idx+1];
  nav.innerHTML = `
    ${next? `<a href="/blog/post.html?p=${encodeURIComponent(next.slug)}">← ${escapeHtml(next.title)}</a>`:'<span></span>'}
    ${prev? `<a href="/blog/post.html?p=${encodeURIComponent(prev.slug)}">${escapeHtml(prev.title)} →</a>`:''}
  `;

  // Fire ads
  try{ (adsbygoogle=window.adsbygoogle||[]).push({}); (adsbygoogle=window.adsbygoogle||[]).push({}); }catch(_){}
}

// Utils
function fmtDate(d){
  try{ return new Date(d).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}) }catch(_){ return d }
}
function estRead(p){
  // fallback 200 wpm * 5min if no word estimate present
  return (p.estWords? Math.max(1, Math.round(p.estWords/200)):5) + ' min';
}

// Boot
initHome();
initPost();