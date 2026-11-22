// Página Gamelog: lê ../main/lista.csv e monta os cartões. Depende de ../main/site.js (TW).
// Imagens: CreationImage -> pasta char/ ; GameLogo e ImageMain -> pasta images/ (basta o nome do arquivo na planilha).
const imgSrc=(v,dir)=>!v?'':((/^(https?:|data:|\/|\.{1,2}\/)/i.test(v)||v.includes('/'))?v:dir+'/'+v.toLowerCase());
function parseCSV(t){
 const first=t.split(/\r?\n/,1)[0],cnt=c=>first.split(c).length-1;
 const d=[',',';','\t'].sort((a,b)=>cnt(b)-cnt(a))[0];
 const rows=[];let row=[],f='',q=false;
 for(let i=0;i<t.length;i++){const c=t[i];
  if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}
  else if(c==='"')q=true;
  else if(c===d){row.push(f);f=''}
  else if(c==='\n'){row.push(f);rows.push(row);row=[];f=''}
  else if(c!=='\r')f+=c}
 if(f!==''||row.length){row.push(f);rows.push(row)}
 const h=rows[0].map(x=>x.trim());
 return rows.slice(1).filter(r=>r.some(x=>x.trim())).map(r=>{const o={};h.forEach((k,i)=>o[k]=(r[i]||'').trim());return o});
}
async function loadCSV(url){
 const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw new Error('HTTP '+r.status);
 const buf=await r.arrayBuffer();let t;
 try{t=new TextDecoder('utf-8',{fatal:true}).decode(buf)}catch(e){t=new TextDecoder('windows-1252').decode(buf)}
 return parseCSV(t.replace(/^\uFEFF/,''));
}
(async()=>{
let RAW;
try{RAW=await loadCSV('../main/lista.csv')}catch(e){
 const b=TW.lang==='br',loc=location.protocol==='file:';
 document.getElementById('list').innerHTML='<p style="text-align:center;padding:30px 10px">'+(b?'Não foi possível carregar main/lista.csv.':'Could not load main/lista.csv.')+(loc?(b?' Abrindo o arquivo direto do computador o navegador bloqueia a leitura; use o site publicado ou um servidor local.':' Browsers block this when the file is opened straight from disk; use the published site or a local server.'):'')+'</p>';
 return}
const clean=v=>{v=(v||'').trim();return v==='-'?'':v};
const DATA=RAW.map(r=>{const o={};for(const k in r)o[k.trim()]=clean(r[k]);return o});
const opened=new Set();let lang=TW.lang;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pick=(r,k)=>(lang==='br'&&r[k+'BR'])?r[k+'BR']:(r[k]||'');
const isUrl=s=>/^https?:\/\//i.test(s);
const U=u=>/^https?:\/\//i.test(u)?u:'https://'+u;
const paras=(t,c)=>(t||'').split(/\|\||\r?\n/).map(x=>x.trim()).filter(Boolean).map(x=>`<p${c?` class="${c}"`:''}>${esc(x)}</p>`).join('');
const links=s=>{const a=s.split('*').map(x=>x.trim()).filter(Boolean).map(x=>{const m=x.match(/^(.*?)\s*<([^>\s]+\.[^>\s]+)>$/);if(m)return `<a href="${esc(U(m[2]))}" target="_blank" rel="noopener">${esc(m[1]||m[2])}</a>`;return isUrl(x)?`<a href="${esc(x)}" target="_blank" rel="noopener">${esc(x)}</a>`:`<span>${esc(x)}</span>`});return a.length?`<div class="lks">${a.join('<i class="sep" aria-hidden="true">\u00b7</i>')}</div>`:''};
const img=(s,alt)=>`<img src="${esc(s)}" alt="${esc(alt)}" data-ph="${esc(s)}">`;
function groups(){const g=[];DATA.forEach(r=>{const last=g[g.length-1];if(!r.GameName&&last)last.rows.push(r);else if(last&&r.GameName===last.head.GameName)last.rows.push(r);else g.push({head:r,rows:[r]})});return g}
function hasCard(r){return ['SeriesName','SeriesDesc','SeriesDescBR','CreationName','CreationDesc','CreationDescBR','Lore','LoreBR','VideoLink','ImageLink','FileLink','Blog'].some(k=>r[k])}
function tile(h){const m=[h.GameDataHouse,h.GameDataYear,h.GameDataConsole].filter(Boolean),n=esc(h.GameName),d=pick(h,'GameDesc');return `<div class="tile"><b>${h.GameLink&&isUrl(h.GameLink)?`<a href="${esc(h.GameLink)}" target="_blank" rel="noopener">${n}</a>`:n}</b>${m.length?`<small>${m.map(x=>`<span>${esc(x)}</span>`).join('')}</small>`:''}${d?`<p>${esc(d)}</p>`:''}</div>`}
function tileWrap(a){let o='',open=false;a.forEach(s=>{const t=s.startsWith('<div class="tile"');if(t&&!open){o+='<div class="tiles">';open=true}if(!t&&open){o+='</div>';open=false}o+=s});return o+(open?'</div>':'')}
function gmeta(m){const [h,y,c]=m;if(!h&&!y&&!c)return'';const d='<i class="dot" aria-hidden="true">\u2022</i>';
 if(!y)return `<div class="gmeta">${[h,c].filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join(d)}</div>`;
 const yy=/mori/i.test(y)?'<b class="cross" aria-label="Memento Mori">\u271d</b>':esc(y);
 return `<div class="gmeta tri"><span class="gl">${h?esc(h)+d:''}</span><span class="gc">${yy}</span><span class="gr">${c?d+esc(c):''}</span></div>`}
const ICON='<svg viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges" aria-hidden="true" focusable="false"><path fill="currentColor" d="M11 2h2v1h-2zM15 2h4v1h-4zM10 3h2v1h-2zM14 3h4v1h-4zM6 4h1v1h-1zM9 4h2v1h-2zM13 4h4v1h-4zM21 4h4v1h-4zM5 5h1v1h-1zM8 5h3v1h-3zM13 5h4v1h-4zM19 5h4v1h-4zM4 6h2v1h-2zM8 6h3v1h-3zM12 6h4v1h-4zM17 6h5v1h-5zM29 6h1v1h-1zM4 7h2v1h-2zM7 7h15v1h-15zM28 7h2v1h-2zM3 8h3v1h-3zM7 8h14v1h-14zM26 8h3v1h-3zM3 9h26v1h-26zM2 10h26v1h-26zM2 11h10v1h-10zM16 11h12v1h-12zM2 12h6v1h-6zM10 12h3v1h-3zM18 12h9v1h-9zM3 13h5v1h-5zM10 13h3v1h-3zM20 13h6v1h-6zM4 14h3v1h-3zM9 14h4v1h-4zM22 14h3v1h-3zM5 15h7v1h-7zM4 16h10v1h-10zM17 16h1v1h-1zM4 17h13v1h-13zM4 18h1v1h-1zM7 18h10v1h-10zM7 19h3v1h-3zM11 19h5v1h-5zM7 20h4v1h-4zM12 20h4v1h-4zM6 21h5v1h-5zM13 21h2v1h-2zM6 22h6v1h-6zM6 23h7v1h-7zM6 24h1v1h-1zM8 24h6v1h-6zM8 25h4v1h-4zM8 26h3v1h-3zM8 27h2v1h-2zM9 28h1v1h-1z"/></svg>';
function card(r,id){
 if(!hasCard(r))return'';
 const side=[['VideoLink','Video'],['ImageLink','Images'],['FileLink','Downloads'],['Blog','Blog']].filter(([k])=>r[k]).map(([k,t])=>`<div><b>${t}</b>${links(r[k])}${k==='FileLink'&&pick(r,'FileDesc')?`<small>${esc(pick(r,'FileDesc'))}</small>`:''}</div>`).join('');
 const lore=pick(r,'Lore');
 const cr=r.CreationName?`<div class="cr"><h4>${esc(r.CreationName)}</h4>${r.CreationImage?img(imgSrc(r.CreationImage,'char'),r.CreationName):'<div class="ph"></div>'}<div class="cdesc">${paras(pick(r,'CreationDesc'))}</div></div>`:'';
 return `<div class="cw">${r.SeriesName?`<div class="tab">${esc(r.SeriesName)}</div>`:''}<article class="card${r.SeriesName?' hastab':''}"><div class="main${lore?' haslore':''}">${paras(pick(r,'SeriesDesc'),'sdesc')}${cr}${r.ImageMain?`<button class="zoomable" type="button" data-zoom="${esc(imgSrc(r.ImageMain,'images'))}" aria-label="${lang==='br'?'Ver em tamanho real':'View full size'}">${img(imgSrc(r.ImageMain,'images'),'')}</button>`:''}${lore?`<button class="lorebtn" data-id="${esc(id)}" aria-expanded="${opened.has(id)}" aria-label="Entropia">${ICON}</button>`:''}</div>${lore?`<div class="lorep${opened.has(id)?' open':''}"><div><canvas></canvas><p>${esc(lore).replace(/\|\|/g,'\n\n')}</p></div></div>`:''}</article>${side?`<aside>${side}</aside>`:''}</div>`}
function render(){
 ui();
 document.getElementById('list').innerHTML=view().map(({head:h,rows},gi,arr)=>{
  const cards=rows.map((r,i)=>card(r,h.GameName+'#'+i)).join('');
  const hr=gi>0&&ltr(h.GameName)!==ltr(arr[gi-1].head.GameName)?'<hr class="letter">':'';
  const t=h.GameLogo?`<img src="${esc(imgSrc(h.GameLogo,'images'))}" alt="${esc(h.GameName)}" data-title="${esc(h.GameName)}">`:`<h2>${esc(h.GameName)}</h2>`;
  const meta=[h.GameDataHouse,h.GameDataYear,h.GameDataConsole];
  return hr+`<section class="game${cards?'':' bare'}"><div class="gtitle">${h.GameLink&&isUrl(h.GameLink)?`<a href="${esc(h.GameLink)}" target="_blank" rel="noopener">${t}</a>`:t}</div>${gmeta(meta)}${paras(pick(h,'GameDesc'),'gdesc')}${cards}</section>`}).join('');
 document.querySelectorAll('img').forEach(i=>i.addEventListener('error',()=>{
  if(i.dataset.title){const h=document.createElement('h2');h.textContent=i.dataset.title;i.replaceWith(h)}
  else{const d=document.createElement('div');d.className='ph';d.textContent=i.dataset.ph||'';i.replaceWith(d)}}));
 document.querySelectorAll('.lorep.open').forEach(lstars);
}
document.getElementById('list').addEventListener('click',e=>{const b=e.target.closest('.lorebtn');if(!b)return;const id=b.dataset.id,p=b.closest('.card').querySelector('.lorep'),o=!p.classList.contains('open');p.classList.toggle('open',o);b.setAttribute('aria-expanded',o);o?opened.add(id):opened.delete(id);if(o)lstars(p)});
const norm=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const toks=c=>(c||'').split(/[-\/,]/).map(x=>x.trim()).filter(Boolean);
const TOK=(()=>{const m={};DATA.forEach(r=>toks(r.GameDataConsole).forEach(t=>m[t]=(m[t]||0)+1));return Object.keys(m).sort((a,b)=>m[b]-m[a]||a.localeCompare(b))})();
const hkey=v=>norm(v).replace(/\s+/g,'');
const HOU=(()=>{const m={};DATA.forEach(r=>{const v=r.GameDataHouse;if(!v)return;const k=hkey(v);(m[k]=m[k]||{n:0,l:v}).n++});return Object.entries(m).sort((a,b)=>b[1].n-a[1].n||a[1].l.localeCompare(b[1].l)).map(([k,o])=>[k,o.l])})();
const ltr=n=>{const c=norm(n).charAt(0).toUpperCase();return /[A-Z]/.test(c)?c:'#'};
function view(){const q=norm(document.getElementById('q').value.trim()),c=document.getElementById('con').value,hv=document.getElementById('hou').value;
 const a=groups().filter(g=>(!q||norm(g.head.GameName).includes(q))&&(!c||toks(g.head.GameDataConsole).includes(c))&&(!hv||hkey(g.head.GameDataHouse)===hv));
 document.getElementById('count').textContent=a.length+(lang==='br'?(a.length===1?' jogo':' jogos'):(a.length===1?' game':' games'));return a}
function bar(){const b=lang==='br',q=document.getElementById('q'),s=document.getElementById('con'),cur=s.value;
 q.placeholder=b?'Buscar por nome':'Search by name';q.setAttribute('aria-label',q.placeholder);
 s.innerHTML=`<option value="">${b?'(Consoles)':'(Consoles)'}</option>`+TOK.map(t=>`<option>${esc(t)}</option>`).join('');s.value=cur;const hs=document.getElementById('hou'),hc=hs.value;hs.innerHTML=`<option value="">${b?'(Studios)':'(Studios)'}</option>`+HOU.map(([k,l])=>`<option value="${esc(k)}">${esc(l)}</option>`).join('');hs.value=hc}
function lstars(p){const cv=p.querySelector('canvas'),cx=cv.getContext('2d'),box=p.querySelector('div'),tx=box.querySelector('p');
 const d=devicePixelRatio||1,W=box.clientWidth,H=Math.max(tx.scrollHeight+44,80);
 cv.style.width=W+'px';cv.style.height=H+'px';cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0);
 const S=Array.from({length:Math.round(W*H/7000)},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.4+.4,a:Math.random()*.5+.4}));
 const col=getComputedStyle(p).getPropertyValue('--lstar').trim()||'#888';
 cancelAnimationFrame(cv._f);
 const f=()=>{cx.clearRect(0,0,W,H);cx.fillStyle=col;S.forEach(s=>{if(!TW.still){s.x-=s.r*.65;if(s.x<-2)s.x=W+2}cx.globalAlpha=s.a;cx.beginPath();cx.arc(s.x,s.y,s.r,0,6.283);cx.fill()});if(!TW.still&&p.classList.contains('open'))cv._f=requestAnimationFrame(f)};
 f()}
document.getElementById('q').addEventListener('input',render);
document.getElementById('con').addEventListener('change',render);
document.getElementById('hou').addEventListener('change',render);
document.getElementById('top').onclick=()=>scrollTo({top:0,behavior:TW.still?'auto':'smooth'});
const ab=document.getElementById('about');
document.getElementById('info').onclick=()=>{ab.showModal();ab.querySelector('div').scrollTop=0};
ab.addEventListener('click',e=>{if(e.target===ab||e.target.id==='aboutclose')ab.close()});
const zm=document.getElementById('zoom');
document.getElementById('list').addEventListener('click',e=>{const z=e.target.closest('.zoomable');if(!z)return;zm.querySelector('img').src=z.dataset.zoom;zm.showModal()});
zm.addEventListener('click',()=>zm.close());
const ABOUT={"br": ["Na cultura gamer temos o (péssimo) hábito de contar quantos jogos temos que jogar, baseado no que compramos ou no que existe gratuito para se jogar. Isso seria para servir de conscientização do quanto gastamos com jogos que nunca vamos jogar - o famigerado BACKLOG.", "Bem... É uma ideia idiota. É o mesmo que se depreciar por não ter visto tudo o que existe no planeta. Inalcançável e autodepreciativo.", "Ao longo dos anos, eu joguei muitos jogos, mas nunca parei pra contar quantos exatamente, mas hoje acho bem mais produtivo e edificante do que um backlog. Inclusive, em muitos jogos eu coloquei mais do que o ato de jogar, coloquei minha criatividade neles. Tem jogos onde criei coisas únicas, e que acho que merecem um tipo de museu para ficarem expostas a quem interessar - sejam amigos, família, ou quem pensa e joga como eu.", "Então, nesta página, lhes apresento meu GAMELOG - a lista de todos os jogos que já joguei, e as coisas que criei vivendo nos videogames minha vida afora."], "en": ["In gaming culture, we have the (terrible) habit of counting how many games we have to play, based on what we’ve bought or what’s available to play for free. The idea is to make us more aware of how much we spend on games we’ll never actually play — the infamous BACKLOG.", "Well... It’s a stupid idea. It’s like putting yourself down for not having seen everything there is to see on the planet. It’s unattainable and self-deprecating.", "Over the years, I’ve played many games, but I’ve never stopped to count exactly how many. Nowadays, though, I find that much more productive and fulfilling than keeping a backlog. In fact, in many games, I’ve put more than just the act of playing into them — I’ve put my creativity. There are games where I’ve created unique things, and I believe they deserve a kind of museum where they can be displayed for anyone interested — whether friends, family, or people who think and play the way I do.", "So, on this page, I’d like to introduce you to my GAMELOG — a list of every game I’ve ever played, along with the things I’ve created while living my life through video games."]};
function ui(){const b=lang==='br';
 document.getElementById('top').textContent=b?'\u2191 Voltar':'\u2191 Back';bar();
 document.getElementById('info').setAttribute('aria-label',b?'Sobre o Gamelog':'About the Gamelog');
 document.getElementById('aboutclose').textContent=b?'Fechar':'Close';
 document.getElementById('abouttext').innerHTML=ABOUT[b?'br':'en'].map(t=>`<p>${esc(t)}</p>`).join('');
 document.querySelectorAll('.lorep.open').forEach(lstars)}
TW.on(k=>{lang=TW.lang;if(k==='lang')render();else document.querySelectorAll('.lorep.open').forEach(lstars)});
render();
})();
