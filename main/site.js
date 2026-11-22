// Código compartilhado por todas as páginas: modo claro/escuro, idioma, barra superior, estrelas.
(function(){
const R=document.documentElement;
const TW=window.TW={lang:'en',theme:'dark',subs:[],still:matchMedia('(prefers-reduced-motion:reduce)').matches,
 on(fn){this.subs.push(fn)},
 root:document.body.dataset.root||'',
 MENU:[
  {k:'index',pt:'\u2302',en:'\u2302',href:'index.html',ok:true,nav:true,tpt:'Início',ten:'Home'},
  {k:'gamelog',pt:'Gamelog',en:'Gamelog',href:'gamelog/gamelog.html',ok:true,
   dpt:'Todos os jogos que já joguei e o que criei dentro deles.',den:'Every game I’ve played, and what I created inside them.'},
  {k:'print',pt:'Impressos',en:'Printables',href:'print/print.html',ok:false,
   dpt:'Cartas, tabuleiros e outros arquivos para imprimir e jogar.',den:'Cards, boards and other files to print and play.'},
  {k:'projects',pt:'Projetos',en:'Projects',href:'projects/projects.html',ok:false,
   dpt:'Mods, jogos que programei e outros projetos de maior importância.',den:'Mods, games I programmed and other major projects.'},
  {k:'files',pt:'Arquivos',en:'Files',href:'files/files.html',ok:false,
   dpt:'Séries de arquivos relacionados a jogos.',den:'Series of game-related files.'}]};
try{TW.lang=localStorage.getItem('tw-lang')==='br'?'br':'en';TW.theme=localStorage.getItem('tw-theme')==='light'?'light':'dark'}catch(e){}

// barra superior: modo | menu | idioma
const bar=document.getElementById('topbar');
bar.innerHTML='<button class="tb" id="themebtn" type="button"></button><nav id="menu"></nav><button class="tb" id="langbtn" type="button"></button>';
const page=document.body.dataset.page||'';
function menu(){const b=TW.lang==='br';
 document.getElementById('menu').innerHTML=TW.MENU.map(m=>{const t=b?m.pt:m.en;
  return m.ok?`<a href="${TW.root+m.href}"${m.k===page?' aria-current="page"':''}${m.nav?` aria-label="${b?m.tpt:m.ten}" title="${b?m.tpt:m.ten}"`:''}>${t}</a>`:`<span class="off" aria-disabled="true" title="${b?'Em breve':'Coming soon'}">${t}</span>`}).join('')}

// estrelas
const cv=document.getElementById('stars'),cx=cv.getContext('2d');let S=[],W=0,H=0,col='#fff';
function size(){const d=devicePixelRatio||1;W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0);S=Array.from({length:Math.round(W*H/9000)},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.4+.4,a:Math.random()*.5+.4}))}
function frame(){cx.clearRect(0,0,W,H);cx.fillStyle=col;S.forEach(s=>{if(!TW.still){s.x-=s.r*.65;if(s.x<-2)s.x=W+2}cx.globalAlpha=s.a;cx.beginPath();cx.arc(s.x,s.y,s.r,0,6.283);cx.fill()});if(!TW.still)requestAnimationFrame(frame)}

function ui(kind){const b=TW.lang==='br',t=document.getElementById('themebtn'),l=document.getElementById('langbtn');
 R.lang=b?'pt-BR':'en';R.dataset.theme=TW.theme;
 t.innerHTML=(TW.theme==='dark'?'\u263e':'\u2600')+'<span class="tl"> '+(TW.theme==='dark'?(b?'Escuro':'Dark'):(b?'Claro':'Light'))+'</span>';
 t.setAttribute('aria-label',b?'Alternar modo claro ou escuro':'Switch light or dark mode');
 l.textContent=b?'BR':'EN';l.setAttribute('aria-label',b?'Idioma: português':'Language: English');
 menu();
 col=getComputedStyle(R).getPropertyValue('--star').trim()||'#fff';if(TW.still)frame();
 TW.subs.forEach(f=>f(kind))}
TW.ui=ui;
document.getElementById('themebtn').onclick=()=>{TW.theme=TW.theme==='dark'?'light':'dark';try{localStorage.setItem('tw-theme',TW.theme)}catch(e){}ui('theme')};
document.getElementById('langbtn').onclick=()=>{TW.lang=TW.lang==='en'?'br':'en';try{localStorage.setItem('tw-lang',TW.lang)}catch(e){}ui('lang')};
addEventListener('resize',()=>{size();if(TW.still)frame()});
// mudanças feitas em outra aba/janela do mesmo site
addEventListener('storage',e=>{if(e.key==='tw-lang'||e.key==='tw-theme'){try{TW.lang=localStorage.getItem('tw-lang')==='br'?'br':'en';TW.theme=localStorage.getItem('tw-theme')==='light'?'light':'dark'}catch(x){}ui(e.key==='tw-lang'?'lang':'theme')}});
size();ui('init');if(!TW.still)frame();
})();
