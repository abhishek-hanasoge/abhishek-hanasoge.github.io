import '@fontsource/onest/400.css';
import '@fontsource/onest/500.css';
import '@fontsource/onest/600.css';
import '@fontsource/onest/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import './styles.css';

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch=matchMedia('(hover: none)').matches;
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),1800)}
const store={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};
const isMac=/Mac|iPhone|iPad/.test(navigator.userAgentData?.platform||navigator.platform);
if(touch)$('#kTip').remove();
else if(!isMac)$('#kHint2').textContent='Ctrl K';
$('#year').textContent=new Date().getFullYear();

/* ---------- background: test grid + release scan ---------- */
// A grid of test points. A scan line sweeps down; bugs (red) appear ahead of it
// and get caught (green) when the scan passes. Points near the cursor light up.
(()=>{
  const c=$('#bg'),x=c.getContext('2d');
  let W,H,dpr,S,cols,rows,lit,bugs=[],scan=-.15,mx=-1e4,my=-1e4,last=0,nextBug=1200;
  const SWEEP=9000,HOVER=150;
  function init(){
    dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;
    c.width=W*dpr;c.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0);
    S=W<600?22:28;cols=Math.ceil(W/S)+1;rows=Math.ceil(H/S)+1;
    lit=new Float32Array(cols*rows);bugs=[];
  }
  const px=i=>(i%cols)*S+S/2, py=i=>Math.floor(i/cols)*S+S/2;
  addEventListener('resize',()=>{init();if(reduce)frame(0)});
  addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;if(reduce)frame(0)},{passive:true});
  document.addEventListener('pointerleave',()=>{mx=my=-1e4});
  init();

  function frame(t){
    const dt=last?Math.min(50,t-last):16;last=t;
    x.clearRect(0,0,W,H);
    const sy=scan*H;

    if(!reduce){
      scan+=dt/SWEEP;if(scan>1.15)scan=-.15;
      // the scan marks each row it crosses as tested
      const r=Math.round((sy-S/2)/S);
      if(r>=0&&r<rows)for(let k=0;k<cols;k++)lit[r*cols+k]=Math.max(lit[r*cols+k],.75);
      const decay=Math.pow(.5,dt/700);
      for(let i=0;i<lit.length;i++)if(lit[i])lit[i]=lit[i]<.01?0:lit[i]*decay;
      // spawn bugs ahead of the scan
      nextBug-=dt;
      if(nextBug<=0&&bugs.length<4&&sy<H-120){
        const minRow=Math.max(0,Math.ceil((sy+80)/S));
        const i=(minRow+Math.floor(Math.random()*(rows-minRow)))*cols+Math.floor(Math.random()*cols);
        if(py(i)<H)bugs.push({i,born:t,caught:0});
        nextBug=1400+Math.random()*2200;
      }
    }

    // base grid, one path
    x.fillStyle='rgba(255,255,255,.13)';x.beginPath();
    for(let i=0;i<cols*rows;i++){const X=px(i),Y=py(i);x.rect(X-.9,Y-.9,1.8,1.8)}
    x.fill();

    // tested + hovered points
    for(let i=0;i<cols*rows;i++){
      const X=px(i),Y=py(i),d=Math.hypot(X-mx,Y-my),h=d<HOVER?1-d/HOVER:0,l=lit[i];
      if(l<.02&&h<.02)continue;
      x.globalAlpha=Math.min(1,l*.7+h*.55);
      x.fillStyle=l>h?'#4ade9b':'#cfeedd';
      const s=1.6+l*1.4+h*1.6;x.fillRect(X-s/2,Y-s/2,s,s);
    }
    x.globalAlpha=1;

    if(!reduce){
      // scan line with a soft trail
      const g=x.createLinearGradient(0,sy-90,0,sy);
      g.addColorStop(0,'rgba(74,222,155,0)');g.addColorStop(1,'rgba(74,222,155,.05)');
      x.fillStyle=g;x.fillRect(0,sy-90,W,90);
      x.fillStyle='rgba(74,222,155,.22)';x.fillRect(0,sy,W,1);

      // bugs: pulse red until the scan reaches them, then get caught
      bugs=bugs.filter(b=>{
        const X=px(b.i),Y=py(b.i);
        if(!b.caught&&sy>=Y){b.caught=t;lit[b.i]=1.4}
        if(!b.caught){
          const a=Math.min(1,(t-b.born)/400),p=(Math.sin((t-b.born)/260)+1)/2;
          x.globalAlpha=a;x.fillStyle='#f87171';x.beginPath();x.arc(X,Y,3.2,0,6.283);x.fill();
          x.globalAlpha=a*(.6-.4*p);x.strokeStyle='#f87171';x.lineWidth=1;
          x.beginPath();x.arc(X,Y,5+p*5,0,6.283);x.stroke();
          x.globalAlpha=1;return true;
        }
        const k=(t-b.caught)/800;if(k>=1)return false;
        x.globalAlpha=1-k;x.strokeStyle='#4ade9b';x.lineWidth=1.4;
        x.beginPath();x.arc(X,Y,3+k*20,0,6.283);x.stroke();
        x.globalAlpha=1;return true;
      });
      requestAnimationFrame(frame);
    }
  }
  reduce?frame(0):requestAnimationFrame(frame);
})();

/* ---------- rotating role (typewriter) ---------- */
(()=>{
  const roles=['QA Leader','Release Gatekeeper','Threat Intel Tester','Bug Hunter','Builder with Claude'];
  const el=$('#rot');if(reduce)return;let i=0,ch=roles[0].length,del=true;
  setTimeout(function tick(){
    const w=roles[i];
    if(del){ch--;el.textContent=w.slice(0,ch)||'​';if(ch===0){del=false;i=(i+1)%roles.length}setTimeout(tick,45)}
    else{const n=roles[i];ch++;el.textContent=n.slice(0,ch);if(ch===n.length){del=true;setTimeout(tick,2000)}else setTimeout(tick,85)}
  },2200);
})();

/* ---------- header + scroll spy + reveal + counters ---------- */
const hdr=$('#hdr'),onScroll=()=>hdr.classList.toggle('scrolled',scrollY>20);
/* mobile menu */
(()=>{
  const btn=$('#menuBtn'),menu=$('#mnav');
  function set(open){menu.hidden=!open;hdr.classList.toggle('menu-open',open);btn.setAttribute('aria-expanded',open);btn.setAttribute('aria-label',open?'Close menu':'Open menu')}
  btn.onclick=()=>set(menu.hidden);
  menu.addEventListener('click',e=>{if(e.target.closest('a'))set(false)});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){set(false);btn.focus()}});
  document.addEventListener('click',e=>{if(!menu.hidden&&!hdr.contains(e.target))set(false)});
  matchMedia('(min-width:821px)').addEventListener('change',e=>{if(e.matches)set(false)});
})();
addEventListener('scroll',onScroll,{passive:true});onScroll();
const spy=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){$$('[data-s]').forEach(a=>a.classList.toggle('active',a.dataset.s===e.target.id))}}),{rootMargin:'-45% 0px -50% 0px'});
$$('section[id]').forEach(s=>spy.observe(s));
const rv=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');rv.unobserve(e.target)}}),{threshold:.12});
$$('.rv').forEach((el,i)=>{el.style.transitionDelay=(i%4)*70+'ms';rv.observe(el)});
// Final values are in the HTML (no-JS / reduced motion); animate from 0 otherwise.
if(!reduce){
  const cnt=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;cnt.unobserve(e.target);const end=+e.target.dataset.count,t0=performance.now();
    (function step(t){const p=Math.min(1,(t-t0)/1200),v=Math.round(end*(1-Math.pow(1-p,3)));e.target.textContent=v;if(p<1)requestAnimationFrame(step)})(t0)}),{threshold:.5});
  $$('[data-count]').forEach(el=>{el.textContent='0';cnt.observe(el)});
}
$$('.card').forEach(c=>c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')}));

/* ---------- Visual regression game ---------- */
(()=>{
  const MY_TIME=11.6,TOTAL=4;
  const ui=$('#aui'),pane=$('#actual'),ov=$('#gOv'),F=$('#gF'),T=$('#gT'),M=$('#gMsg'),B=$('#gB');
  let t0,pen=0,found=0,raf,on=false,best=parseFloat(store.get('regressionBest'))||null;
  const fmt=s=>s.toFixed(1).padStart(4,'0')+'s';
  if(best)B.textContent=fmt(best);
  // every element in the new build is a click target, so keyboard players can't spot the diffs by tab order
  const targets=[...ui.querySelectorAll('b,span,small')].filter(e=>!e.children.length);
  targets.forEach(e=>e.tabIndex=-1);
  function tick(){T.textContent=fmt((performance.now()-t0)/1000+pen);raf=requestAnimationFrame(tick)}
  function start(){
    cancelAnimationFrame(raf);
    $$('#aui [data-d]').forEach(e=>e.classList.remove('found'));found=0;pen=0;F.textContent=0;
    ov.style.display='none';on=true;t0=performance.now();M.textContent='scanning build #482…';tick();
    targets.forEach(e=>e.tabIndex=0);targets[0].focus({preventScroll:true});
  }
  function hit(el,x,y){
    if(!on)return;const d=el.closest('[data-d]');
    if(d&&!d.classList.contains('found')){
      d.classList.add('found');found++;F.textContent=found;M.textContent=`bug ${found} logged · ${d.dataset.d}`;
      if(found===TOTAL)finish();
    }else if(!d){
      pen+=2;M.textContent='no diff there · +2s';
      const r=pane.getBoundingClientRect(),m=document.createElement('span');
      m.className='miss';m.style.left=x-r.left+'px';m.style.top=y-r.top+'px';pane.appendChild(m);setTimeout(()=>m.remove(),600);
    }
  }
  ui.addEventListener('click',e=>hit(e.target,e.clientX,e.clientY));
  ui.addEventListener('keydown',e=>{
    if(e.key!=='Enter'&&e.key!==' ')return;e.preventDefault();
    const r=e.target.getBoundingClientRect();hit(e.target,r.left+r.width/2,r.top+r.height/2);
  });
  function finish(){
    on=false;cancelAnimationFrame(raf);targets.forEach(e=>e.tabIndex=-1);
    const t=(performance.now()-t0)/1000+pen;T.textContent=fmt(t);
    if(best===null||t<best){best=t;store.set('regressionBest',String(t))}
    B.textContent=fmt(best);
    const win=t<MY_TIME;M.textContent='4/4 regressions caught · build #482 rejected';
    ov.innerHTML=`<h3>${win?'You beat me. Want a job?':'Build #482 rejected.'}</h3><p>Your time: <b>${fmt(t)}</b>${pen?` (incl. ${pen}s penalty)`:''}. The diffs: protocol version, severity colour, item count and a typo in the button.</p><button class="btn primary" id="gAgain">↻ Run again</button>`;
    ov.style.display='flex';const again=$('#gAgain');again.onclick=start;again.focus({preventScroll:true});
  }
  $('#gGo').onclick=start;
})();

/* ---------- command palette ---------- */
(()=>{
  const LINKEDIN='https://www.linkedin.com/in/abhishek-hanasoge/';
  const cmds=[
    {g:'Navigate',t:'Go to Work',k:'work experience',a:()=>go('#work')},
    {g:'Navigate',t:'Go to Projects',k:'build',a:()=>go('#build')},
    {g:'Navigate',t:'Go to QA metrics',k:'test stats',a:()=>go('#test')},
    {g:'Navigate',t:'Play Visual Regression',k:'game play diff bug',a:()=>go('#play')},
    {g:'Navigate',t:'About me',k:'explore',a:()=>go('#about')},
    {g:'Navigate',t:'Contact',k:'hi say',a:()=>go('#contact')},
    {g:'Actions',t:'Message me on LinkedIn',k:'contact linkedin',a:()=>window.open(LINKEDIN,'_blank','noopener')},
    {g:'Actions',t:'Download resume',k:'resume cv pdf',a:()=>window.open('/assets/Abhishek-Hanasoge-QA-Lead-Resume.pdf','_blank','noopener')},
    {g:'Actions',t:'Back to top',k:'home',a:()=>go('#top')},
  ];
  const bg=$('#cmdk'),inp=$('#kIn'),list=$('#kList');let sel=0,shown=[],lastFocus=null;
  function go(h){const t=document.querySelector(h);t.scrollIntoView({behavior:reduce?'auto':'smooth'});history.replaceState(null,'',h==='#top'?location.pathname:h)}
  function draw(){
    const q=inp.value.toLowerCase().trim();shown=cmds.filter(c=>(c.t+' '+c.k).toLowerCase().includes(q));
    sel=Math.min(sel,Math.max(0,shown.length-1));let html='',g='';
    shown.forEach((c,i)=>{if(c.g!==g){g=c.g;html+=`<div class="grp" role="presentation">${g}</div>`}html+=`<li id="k${i}" role="option" aria-selected="${i===sel}" data-i="${i}" class="${i===sel?'sel':''}">${c.t}<small>↵</small></li>`});
    list.innerHTML=html||'<li aria-disabled="true">No results</li>';
    if(shown.length)inp.setAttribute('aria-activedescendant','k'+sel);else inp.removeAttribute('aria-activedescendant');
    list.querySelector('.sel')?.scrollIntoView({block:'nearest'});
    list.querySelectorAll('li[data-i]').forEach(li=>{li.onclick=()=>run(+li.dataset.i);li.onmousemove=()=>{if(sel!==+li.dataset.i){sel=+li.dataset.i;draw()}}});
  }
  const isOpen=()=>bg.classList.contains('show');
  function open(){lastFocus=document.activeElement;bg.classList.add('show');inp.value='';sel=0;draw();setTimeout(()=>inp.focus(),10)}
  function close(){bg.classList.remove('show');lastFocus?.focus?.({preventScroll:true})}
  function run(i){const c=shown[i];if(!c)return;close();setTimeout(c.a,60)}
  bg.onclick=e=>{if(e.target===bg)close()};
  inp.oninput=()=>{sel=0;draw()};
  addEventListener('keydown',e=>{
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();isOpen()?close():open();return}
    if(!isOpen())return;
    if(e.key==='Escape')close();
    else if(e.key==='Tab'){e.preventDefault();inp.focus()}
    else if(!shown.length)return;
    else if(e.key==='ArrowDown'){e.preventDefault();sel=(sel+1)%shown.length;draw()}
    else if(e.key==='ArrowUp'){e.preventDefault();sel=(sel-1+shown.length)%shown.length;draw()}
    else if(e.key==='Enter'){e.preventDefault();run(sel)}
  });
})();
