import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

const root = process.cwd();
const src = path.join(root, 'content');
const out = path.join(root, 'dist');
const BASE = '/ygqms/';
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const categoryOrder = ['面试速背', '项目面试', '通用面试', '单位与岗位'];
const categoryLabels = {
  '面试速背': '面试速背',
  '项目面试': '项目与技术',
  '通用面试': '通用面试',
  '单位与岗位': '单位与岗位'
};
const categoryIcons = {
  '面试速背': '🧠',
  '项目面试': '🛠️',
  '通用面试': '💬',
  '单位与岗位': '🏢'
};
const categoryDescriptions = {
  '面试速背': '开场介绍与高频问题，适合面试前快速复习',
  '项目面试': '项目叙事、技术细节、职责边界与尖锐追问',
  '通用面试': 'STAR 故事、核心优势和结构化问答',
  '单位与岗位': '央国企、科研院所的岗位理解与回答策略'
};
const categoryOf = (title) => {
  if (title.includes('自我介绍') || title.includes('速背')) return '面试速背';
  if (['XMagital','团队协作','千言'].some(x => title.includes(x))) return '项目面试';
  if (title.includes('科研院所') || title.includes('央国企')) return '单位与岗位';
  return '通用面试';
};
const titleOf = s => s.replace(/\.md$/, '');
const slug = s => encodeURIComponent(s);
const fileName = title => `${title}.html`;
const files = fs.readdirSync(src).filter(x => x.endsWith('.md') && x !== 'index.md');
const docs = files.map(f => ({ file: f, title: titleOf(f), category: categoryOf(titleOf(f)) }));
const docByTitle = new Map(docs.map(d => [d.title, d]));
const docHref = (title) => {
  const d = docByTitle.get(title.trim());
  return d ? `${BASE}${slug(d.category)}/${slug(d.title)}.html` : null;
};
const clean = s => s
  .replace(/(?:C:|D:)[\\/][^\n`)]*/gi, '[已隐藏本地路径]')
  .replace(/https?:\/\/[^\s)]+/g, u => u.includes('github.com') ? u : '[已隐藏外部私有链接]')
  .replace(/(?<!\d)1[3-9]\d{9}(?!\d)/g, '[已隐藏联系方式]')
  .replace(/\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]/g, (_, n, t) => {
    const target = docHref(n);
    return target ? `[${t || n}](${target})` : (t || n);
  });

const esc = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const strip = s => s.replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, ' ').trim();
const idFor = (text, i) => {
  const base = strip(text).toLowerCase().replace(/[^\w\u4e00-\u9fff-]+/g, '-').replace(/^-+|-+$/g, '') || `section-${i}`;
  return base;
};
function headingIcon(title) {
  if (/自我介绍|开场/.test(title)) return '👋';
  if (/优点|优势|竞争力|护城河/.test(title)) return '💎';
  if (/缺点|不足|改进/.test(title)) return '🔧';
  if (/困难|问题|挑战|故障/.test(title)) return '🧩';
  if (/项目|技术|架构|实现|链路/.test(title)) return '⚙️';
  if (/团队|协作|职责|分工/.test(title)) return '🤝';
  if (/规划|选择|动机|方向/.test(title)) return '🧭';
  if (/风险|边界|防御|保密|安全/.test(title)) return '🛡️';
  if (/问答|追问|回答|反问/.test(title)) return '💬';
  if (/数据|指标|口径|证据/.test(title)) return '📊';
  return '📌';
}
function renderMarkdown(markdown) {
  const html = marked.parse(markdown);
  const headings = [];
  let index = 0;
  const body = html.replace(/<h([1-6])>([\s\S]*?)<\/h\1>/g, (_, level, text) => {
    const id = idFor(text, index++);
    const plain = strip(text);
    headings.push({ level: Number(level), text: plain, id });
    const icon = level === '2' ? headingIcon(plain) : '';
    return `<h${level} id="${id}">${icon ? `<span class="heading-icon" aria-hidden="true">${icon}</span>` : ''}${text}</h${level}>`;
  });
  const enhanced = body.replace(/(<h2\b[\s\S]*?)(?=<h2\b|$)/g, '<section class="content-card">$1</section>');
  return { body: enhanced, headings };
}
function treeHtml(current) {
  return categoryOrder.map(cat => {
    const items = docs.filter(d => d.category === cat);
    if (!items.length) return '';
    return `<section class="tree-group"><div class="tree-title"><span>${categoryIcons[cat]}</span>${categoryLabels[cat]}</div>${items.map(d => `<a class="tree-link ${d.title === current ? 'active' : ''}" href="${docHref(d.title)}">${esc(d.title)}</a>`).join('')}</section>`;
  }).join('');
}
function topNav(currentCat) {
  return `<a href="${BASE}">🏠 首页</a>` + categoryOrder.map(c => `<a class="${c === currentCat ? 'active' : ''}" href="${BASE}#${slug(c)}">${categoryIcons[c]} ${categoryLabels[c]}</a>`).join('');
}
function tocHtml(headings) {
  const hs = headings.filter(h => h.level >= 2 && h.level <= 4);
  return hs.length ? `<div class="toc-title">📑 本页目录</div><nav class="toc">${hs.map(h => `<a class="toc-${h.level}" href="#${h.id}">${esc(h.text)}</a>`).join('')}</nav>` : '';
}
const style = `<style>
:root{color-scheme:light;--bg:#f7f8fa;--surface:#fff;--surface-2:#f2f5f8;--text:#1f2933;--muted:#667584;--line:#e1e7ed;--accent:#1769aa;--accent-bg:#eaf3fb;--shadow:0 4px 18px rgba(35,55,75,.06)}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.75 -apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",Arial,sans-serif}.topbar{position:sticky;top:0;z-index:20;height:62px;background:rgba(255,255,255,.96);border-bottom:1px solid var(--line);backdrop-filter:blur(12px)}.topbar-inner{height:100%;max-width:1440px;margin:auto;display:flex;align-items:center;padding:0 28px;gap:28px}.brand{font-size:17px;font-weight:750;white-space:nowrap}.brand a{color:var(--text)}.topnav{display:flex;gap:4px;align-items:center;overflow:auto}.topnav a{white-space:nowrap;padding:7px 12px;border-radius:7px;color:var(--muted)}.topnav a:hover,.topnav a.active{color:var(--accent);background:var(--accent-bg);text-decoration:none}.search{margin-left:auto;width:210px;padding:8px 12px;border:1px solid var(--line);border-radius:7px;color:var(--text);background:#fff}.layout{max-width:1440px;margin:auto;display:grid;grid-template-columns:260px minmax(0,820px) 210px;gap:28px;padding:26px 28px 70px}.sidebar,.rightbar{position:sticky;top:88px;height:calc(100vh - 110px);overflow:auto}.sidebar-heading{font-weight:700;margin:6px 8px 14px}.tree-group{margin:0 0 20px}.tree-title{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:750;letter-spacing:.04em;color:var(--muted);padding:0 9px 6px;text-transform:uppercase}.tree-title span{font-size:15px}.tree-link{display:block;padding:7px 9px;color:#526373;border-radius:6px;line-height:1.45}.tree-link:hover{background:var(--accent-bg);color:var(--accent);text-decoration:none}.tree-link.active{background:var(--accent-bg);color:var(--accent);font-weight:650}.content{min-width:0}.crumbs{font-size:13px;color:var(--muted);margin:3px 0 14px}.crumbs a{color:var(--muted)}article{background:var(--surface);border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow);padding:42px 52px;min-height:600px}.article-title{display:inline-flex;align-items:center;gap:7px;font-size:13px;color:var(--accent);font-weight:700;margin-bottom:12px;padding:5px 10px;border-radius:999px;background:var(--accent-bg)}.article-body h1{font-size:2.05rem;line-height:1.25;margin:0 0 1.3em;letter-spacing:-.02em}.article-body h2{font-size:1.3rem;line-height:1.35;margin:0 0 .75em;padding-bottom:10px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:9px}.heading-icon{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9px;background:var(--accent-bg);font-size:17px;flex:0 0 auto}.content-card{margin:18px -14px;padding:20px 22px;border:1px solid var(--line);border-radius:13px;background:linear-gradient(145deg,#fff 0%,#fbfdff 100%);box-shadow:0 2px 10px rgba(31,68,99,.045)}.content-card:hover{border-color:#c8d9e7;box-shadow:0 5px 18px rgba(31,68,99,.07)}.article-body h3{font-size:1.1rem;margin:1.7em 0 .55em;color:#315571}.article-body p{margin:1em 0}.article-body ul,.article-body ol{padding-left:1.5em}.article-body li{margin:.3em 0}.article-body a{color:var(--accent)}.article-body blockquote{border-left:3px solid #6aa9d5;background:var(--surface-2);color:#4c6070;padding:10px 16px;margin:1.2em 0}.article-body code{font-size:.9em;background:#f0f3f6;border:1px solid var(--line);padding:2px 5px;border-radius:4px}.article-body pre{overflow:auto;background:#f3f5f7;border:1px solid var(--line);padding:15px;border-radius:8px}.article-body table{border-collapse:collapse;width:100%;display:block;overflow:auto;margin:1.2em 0}.article-body th,.article-body td{border:1px solid var(--line);padding:8px 11px;text-align:left;min-width:100px}.article-body th{background:#edf3f7;font-weight:700}.toc-title{font-size:12px;color:var(--muted);font-weight:750;margin:8px 0 10px}.toc{border-left:1px solid var(--line)}.toc a{display:block;padding:3px 0 3px 12px;color:var(--muted);font-size:13px;line-height:1.45}.toc a:hover{color:var(--accent);text-decoration:none}.toc-3{padding-left:24px!important}.toc-4{padding-left:36px!important}.pager{display:flex;justify-content:space-between;gap:12px;margin-top:22px}.pager a{flex:1;border:1px solid var(--line);background:var(--surface);border-radius:11px;padding:13px 15px;color:var(--accent);box-shadow:0 2px 8px rgba(31,68,99,.04);transition:.18s ease}.pager a:hover{transform:translateY(-2px);border-color:#bed3e3;text-decoration:none;box-shadow:0 6px 16px rgba(31,68,99,.08)}.pager a:last-child{text-align:right}.pager small{display:block;color:var(--muted);font-size:11px}.home{grid-column:1/-1}.home article{max-width:1050px;margin:auto}.hero{padding:8px 2px 22px}.hero-badge{display:inline-flex;align-items:center;gap:7px;padding:6px 11px;border-radius:999px;background:var(--accent-bg);color:var(--accent);font-weight:700;font-size:13px}.home h1{font-size:2.45rem;margin:.55em 0 .3em}.hero p{font-size:16px;color:var(--muted);max-width:700px}.category-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:18px}.category-card{position:relative;overflow:hidden;border:1px solid var(--line);background:var(--surface);border-radius:14px;padding:21px 22px;box-shadow:var(--shadow);transition:.18s ease}.category-card:before{content:'';position:absolute;inset:0 auto 0 0;width:4px;background:linear-gradient(#4f9dd3,#74c0a7)}.category-card:hover{transform:translateY(-3px);border-color:#c6d8e5;box-shadow:0 10px 26px rgba(35,55,75,.1)}.category-card-head{display:flex;align-items:center;gap:11px;margin-bottom:7px}.category-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:11px;background:var(--accent-bg);font-size:21px}.category-card h3{margin:0;color:var(--text);font-size:18px}.count-badge{margin-left:auto;padding:3px 8px;border-radius:999px;background:#f0f3f6;color:var(--muted);font-size:11px}.category-card p{color:var(--muted);font-size:13px;margin:0 0 13px;min-height:42px}.category-card a{color:#3e566a;font-size:13px;display:flex;align-items:center;gap:7px;margin-top:6px;padding:4px 0}.category-card a:before{content:'›';color:var(--accent);font-size:18px;line-height:1}.category-card a:hover{color:var(--accent);text-decoration:none}.mobile-menu{display:none}@media(max-width:1100px){.layout{grid-template-columns:230px minmax(0,1fr)}.rightbar{display:none}.search{width:150px}.category-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:760px){.topbar{height:auto;position:sticky}.topbar-inner{padding:11px 15px;display:grid;grid-template-columns:auto 1fr;gap:8px 14px}.brand{font-size:16px}.mobile-menu{display:block;border:1px solid var(--line);background:#fff;color:var(--text);border-radius:6px;padding:5px 9px;justify-self:end}.topnav{grid-column:1/-1;display:none;overflow:auto}.topbar.open .topnav{display:flex}.search{grid-column:1/-1;width:100%;margin:0}.layout{display:block;padding:14px 10px 50px}.sidebar{position:relative;top:auto;height:auto;max-height:0;overflow:hidden;background:var(--surface);border-radius:9px;margin-bottom:12px;transition:max-height .2s;padding:0 10px}.layout.menu-open .sidebar{max-height:650px;padding:14px 10px;overflow:auto}.content{width:100%}article{padding:25px 18px;border-radius:11px}.article-body h1{font-size:1.7rem}.article-body h2{font-size:1.18rem}.content-card{margin:14px -5px;padding:17px 15px}.heading-icon{width:31px;height:31px;font-size:16px}.category-grid{grid-template-columns:1fr;gap:13px}.crumbs{padding:0 3px}.category-grid{grid-template-columns:1fr}.home article{padding:25px 18px}}
</style>`;
const script = `<script>
const top=document.querySelector('.topbar'), menu=document.querySelector('.mobile-menu'), layout=document.querySelector('.layout');
menu?.addEventListener('click',()=>{top.classList.toggle('open');layout.classList.toggle('menu-open')});
const q=document.querySelector('.search');q?.addEventListener('input',()=>{const v=q.value.toLowerCase();document.querySelectorAll('.tree-link').forEach(a=>a.style.display=a.textContent.toLowerCase().includes(v)?'block':'none')});
</script>`;
function page(title, category, body, toc='', pager='') {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} · 面试知识库</title>${style}</head><body><header class="topbar"><div class="topbar-inner"><div class="brand"><a href="${BASE}">面试知识库</a></div><button class="mobile-menu">☰ 目录</button><nav class="topnav">${topNav(category)}</nav><input class="search" placeholder="搜索文章…"></div></header><div class="layout"><aside class="sidebar"><div class="sidebar-heading">知识库目录</div>${treeHtml(title)}</aside><main class="content">${body}${pager}</main><aside class="rightbar">${toc}</aside></div>${script}</body></html>`;
}
const sorted = [...docs].sort((a,b)=>categoryOrder.indexOf(a.category)-categoryOrder.indexOf(b.category)||a.title.localeCompare(b.title,'zh-CN'));
for (const d of docs) {
  const raw=fs.readFileSync(path.join(src,d.file),'utf8');
  const md=clean(raw.replace(/^---[\s\S]*?---/,'').trim());
  const rendered=renderMarkdown(md);
  const i=sorted.findIndex(x=>x.title===d.title);
  const prev=sorted[i-1], next=sorted[i+1];
  const pager=`<nav class="pager">${prev?`<a href="${docHref(prev.title)}"><small>上一篇</small>← ${esc(prev.title)}</a>`:'<span></span>'}${next?`<a href="${docHref(next.title)}"><small>下一篇</small>${esc(next.title)} →</a>`:'<span></span>'}</nav>`;
  const body=`<div class="crumbs"><a href="${BASE}">首页</a> / <a href="${BASE}#${slug(d.category)}">${categoryLabels[d.category]}</a> / ${esc(d.title)}</div><article><div class="article-title">${categoryIcons[d.category]} ${categoryLabels[d.category]}</div><div class="article-body">${rendered.body}</div></article>`;
  const dir=path.join(out,d.category); fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,fileName(d.title)),page(d.title,d.category,body,tocHtml(rendered.headings),pager));
  // Preserve previously published root URLs with an instant redirect.
  fs.writeFileSync(path.join(out,fileName(d.title)),`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${docHref(d.title)}"><link rel="canonical" href="${docHref(d.title)}"><title>${esc(d.title)}</title></head><body><p>页面已移动：<a href="${docHref(d.title)}">${esc(d.title)}</a></p></body></html>`);
}
const categoryCards=categoryOrder.map(cat=>{const items=docs.filter(d=>d.category===cat);return `<section id="${slug(cat)}" class="category-card"><div class="category-card-head"><span class="category-icon">${categoryIcons[cat]}</span><h3>${categoryLabels[cat]}</h3><span class="count-badge">${items.length} 篇</span></div><p>${categoryDescriptions[cat]}</p>${items.map(d=>`<a href="${docHref(d.title)}">${esc(d.title)}</a>`).join('')}</section>`}).join('');
const homeBody=`<section class="home"><article><div class="hero"><div class="hero-badge">🎯 面试准备知识库</div><h1>央国企 / 科研院所面试知识库</h1><p>按面试场景组织内容，快速找到需要熟背的问题、项目表达和岗位回答策略。</p></div><div class="category-grid">${categoryCards}</div></article></section>`;
fs.writeFileSync(path.join(out,'index.html'),page('首页','',homeBody));
