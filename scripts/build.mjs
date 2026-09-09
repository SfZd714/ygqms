import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

const root=process.cwd();
const src=path.join(root,'content');
const out=path.join(root,'dist');
fs.rmSync(out,{recursive:true,force:true}); fs.mkdirSync(out,{recursive:true});
// index.md is the site landing-page source, not a navigable article.
const files=fs.readdirSync(src).filter(x=>x.endsWith('.md') && x !== 'index.md');
const titleOf=s=>s.replace(/\.md$/,'');
const slug=s=>encodeURIComponent(titleOf(s));
const fileName=s=>titleOf(s)+'.html';
const clean=s=>s.replace(/(?:C:|D:)[\\/][^\n`)]*/gi,'[已隐藏本地路径]')
 .replace(/https?:\/\/[^\s)]+/g,(u)=>u.includes('github.com')?u:'[已隐藏外部私有链接]')
 .replace(/(?<!\d)1[3-9]\d{9}(?!\d)/g,'[已隐藏联系方式]')
 .replace(/\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]/g,(_,n,t)=>`[${t||n}](${slug(n.trim())}.html)`);
const nav=files.map(f=>`<a href="${slug(f)}.html">${f.replace(/\.md$/,'')}</a>`).join('');
const style=`<style>
:root{color-scheme:light;--bg:#f6f8fb;--panel:#fff;--text:#17212b;--muted:#617080;--accent:#1769aa;--line:#d7e0e8}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.75 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif}a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}.layout{display:flex;min-height:100vh}.side{width:280px;position:sticky;top:0;height:100vh;overflow:auto;background:var(--panel);border-right:1px solid var(--line);padding:24px 18px}.brand{font-weight:700;font-size:18px;margin-bottom:18px}.search{width:100%;padding:10px 12px;background:#fff;border:1px solid var(--line);border-radius:8px;color:var(--text);margin-bottom:16px}.nav a{display:block;padding:6px 8px;border-radius:6px;color:var(--muted);font-size:14px}.nav a:hover{background:#edf4fa;color:var(--text)}.main{width:min(920px,100%);padding:38px 34px 80px;margin:auto}article{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:30px 38px;box-shadow:0 2px 8px rgba(29,55,78,.04)}h1{font-size:2rem;line-height:1.25;margin-top:0}h2{font-size:1.4rem;margin-top:2em;border-bottom:1px solid var(--line);padding-bottom:6px}h3{font-size:1.1rem;color:#234b6b}blockquote{border-left:3px solid var(--accent);padding:2px 16px;margin-left:0;color:#465c6d;background:#f2f7fb}code{background:#f1f4f7;border:1px solid var(--line);padding:2px 5px;border-radius:4px}pre{overflow:auto;background:#f1f4f7;padding:14px;border-radius:8px}table{border-collapse:collapse;width:100%;display:block;overflow:auto}th,td{border:1px solid var(--line);padding:7px 10px;text-align:left}th{background:#edf2f6}.meta{color:var(--muted);font-size:13px;margin-bottom:20px}@media(max-width:760px){.layout{display:block}.side{position:relative;width:auto;height:auto;border-right:0;border-bottom:1px solid var(--line);padding:16px}.nav{display:none}.side.open .nav{display:block}.main{padding:16px 10px 50px}article{padding:20px 17px;border-radius:10px}h1{font-size:1.55rem}body{font-size:15px}.toggle{display:block!important}}.toggle{display:none;background:#edf2f6;border:1px solid var(--line);color:var(--text);padding:8px 10px;border-radius:6px;margin-bottom:10px}</style>`;
const script=`<script>const q=document.querySelector('.search'),links=[...document.querySelectorAll('.nav a')];q?.addEventListener('input',()=>{let v=q.value.toLowerCase();links.forEach(a=>a.style.display=a.textContent.toLowerCase().includes(v)?'block':'none')});document.querySelector('.toggle')?.addEventListener('click',()=>document.querySelector('.side').classList.toggle('open'));</script>`;
function page(title,body){return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · 面试知识库</title>${style}</head><body><div class="layout"><aside class="side"><button class="toggle">☰ 页面目录</button><div class="brand"><a href="index.html">面试知识库</a></div><input class="search" placeholder="搜索页面…"><nav class="nav">${nav}</nav></aside><main class="main"><article>${body}</article></main></div>${script}</body></html>`}
for(const f of files){let raw=fs.readFileSync(path.join(src,f),'utf8');let title=titleOf(f);let body=marked.parse(clean(raw.replace(/^---[\s\S]*?---/,'').trim()));fs.writeFileSync(path.join(out,fileName(f)),page(title,`<div class="meta">公开脱敏版 · ${title}</div>${body}`));}
const indexBody='<h1>央国企 / 科研院所面试知识库</h1><p>公开脱敏版：项目表达、技术总结、结构化面试和研究所求职方法。</p><h2>页面目录</h2><ul>'+files.map(f=>`<li><a href="${slug(f)}.html">${f.replace(/\.md$/,'')}</a></li>`).join('')+'</ul><blockquote>本网站不包含个人联系方式、家庭/恋爱信息、证明人、网申信息、内部配置、私有链接或本地路径。</blockquote>';fs.writeFileSync(path.join(out,'index.html'),page('首页',indexBody));
