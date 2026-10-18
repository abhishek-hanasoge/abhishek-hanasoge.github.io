import './styles.css';

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch=matchMedia('(hover: none)').matches;
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),1800)}
const store={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};
const isMac=/Mac|iPhone|iPad/.test(navigator.userAgentData?.platform||navigator.platform);
if(touch){$('#kHint').textContent='Menu'}
else if(!isMac){$('#kHint').textContent='Ctrl K';$('#kHint2').textContent='Ctrl K'}
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
addEventListener('scroll',onScroll,{passive:true});onScroll();
const spy=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){$$('.links a').forEach(a=>a.classList.toggle('active',a.dataset.s===e.target.id))}}),{rootMargin:'-45% 0px -50% 0px'});
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

/* ---------- Bug Hunt game ---------- */
(()=>{
  const MY_TIME=19.4;
  const rounds=[
    {file:'parse_feed.py',bug:3,hint:'Mutable default argument — shared across calls.',lines:[
      '<span class="kw">import</span> json',
      '',
      '<span class="kw">def</span> <span class="fn">parse_indicators</span>(raw, seen=[]):',
      '    <span class="cm"># collect unique STIX indicator ids</span>',
      '    <span class="kw">for</span> obj <span class="kw">in</span> json.loads(raw)[<span class="st">"objects"</span>]:',
      '        <span class="kw">if</span> obj[<span class="st">"id"</span>] <span class="kw">not in</span> seen:',
      '            seen.append(obj[<span class="st">"id"</span>])',
      '    <span class="kw">return</span> seen']},
    {file:'paginate.py',bug:5,hint:'Off-by-one: the last page is skipped.',lines:[
      '<span class="kw">def</span> <span class="fn">fetch_all</span>(client, total, size=<span class="nm">100</span>):',
      '    pages = (total + size - <span class="nm">1</span>) // size',
      '    out = []',
      '    <span class="cm"># TAXII collection, page by page</span>',
      '    <span class="kw">for</span> p <span class="kw">in</span> <span class="fn">range</span>(<span class="nm">1</span>, pages):',
      '        out += client.<span class="fn">get</span>(page=p, limit=size)',
      '    <span class="kw">return</span> out']},
    {file:'retry.py',bug:6,hint:'Compares a string to an int — never retries.',lines:[
      '<span class="kw">import</span> time, requests',
      '',
      '<span class="kw">def</span> <span class="fn">get_with_retry</span>(url, tries=<span class="nm">3</span>):',
      '    <span class="kw">for</span> i <span class="kw">in</span> <span class="fn">range</span>(tries):',
      '        r = requests.<span class="fn">get</span>(url, timeout=<span class="nm">10</span>)',
      '        <span class="kw">if</span> r.status_code != <span class="st">"503"</span>:',
      '            <span class="kw">return</span> r',
      '        time.<span class="fn">sleep</span>(<span class="nm">2</span> ** i)',
      '    <span class="kw">return</span> r']}
  ];
  let idx=0,t0=0,penalty=0,raf,best=parseFloat(store.get('bugHuntBest'))||null;
  const body=$('#gBody'),timeEl=$('#gTime'),msg=$('#gMsg'),hint=$('#gHint'),step=$('#gStep');
  const fmt=s=>s.toFixed(2).padStart(5,'0')+'s';
  if(best)$('#gBest').textContent=fmt(best);
  function tick(){timeEl.textContent=fmt((performance.now()-t0)/1000+penalty);raf=requestAnimationFrame(tick)}
  function start(){cancelAnimationFrame(raf);idx=0;penalty=0;t0=performance.now();msg.style.display='flex';tick();render()}
  function render(){
    const r=rounds[idx];$('#gTitle').textContent=r.file;
    body.innerHTML='<div class="code" role="list">'+r.lines.map((l,i)=>`<div class="ln" role="button" tabindex="0" aria-label="Line ${i+1}" data-i="${i+1}"><span style="white-space:pre">${l||' '}</span></div>`).join('')+'</div>';
    hint.textContent='Find the bug.';step.textContent=`${idx+1} / ${rounds.length}`;
    $$('#gBody .ln').forEach(el=>{
      el.onclick=()=>pick(el);
      el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(el)}};
    });
    $('#gBody .ln').focus({preventScroll:true});
  }
  function pick(el){
    const r=rounds[idx];
    if(+el.dataset.i===r.bug){el.classList.add('good');hint.textContent='✓ '+r.hint;$$('#gBody .ln').forEach(e=>{e.onclick=null;e.onkeydown=null});
      setTimeout(()=>{idx++;idx<rounds.length?render():finish()},1100)}
    else{el.classList.add('bad');penalty+=3;hint.textContent='✗ Not that one. +3s';setTimeout(()=>el.classList.remove('bad'),500)}
  }
  function finish(){
    cancelAnimationFrame(raf);const t=(performance.now()-t0)/1000+penalty;
    timeEl.textContent=fmt(t);
    if(best===null||t<best){best=t;store.set('bugHuntBest',String(t))}
    const win=t<MY_TIME;
    body.innerHTML=`<div class="game-intro"><h3>${win?'You beat me. Impressive.':'All bugs squashed.'}</h3>
      <p>Your time: <b style="color:var(--text)">${fmt(t)}</b>${penalty?` (incl. ${penalty}s penalty)`:''}. ${win?'Maybe you should be hiring me.':`My time is ${fmt(MY_TIME)}. Try again?`}</p>
      <button class="btn primary" id="gAgain">Play again</button>
      <div class="best" style="margin-top:16px">My time: ${fmt(MY_TIME)} · Your best: ${fmt(best)}</div></div>`;
    msg.style.display='none';$('#gTitle').textContent='bug_hunt.py';
    const again=$('#gAgain');again.onclick=start;again.focus({preventScroll:true});
  }
  $('#gStart').onclick=start;
})();

/* ---------- command palette ---------- */
(()=>{
  const LINKEDIN='https://www.linkedin.com/in/abhishek-hanasoge/';
  const cmds=[
    {g:'Navigate',t:'Go to Work',k:'work experience',a:()=>go('#work')},
    {g:'Navigate',t:'Go to Projects',k:'build',a:()=>go('#build')},
    {g:'Navigate',t:'Go to QA metrics',k:'test stats',a:()=>go('#test')},
    {g:'Navigate',t:'Play Bug Hunt',k:'game play',a:()=>go('#play')},
    {g:'Navigate',t:'About me',k:'explore',a:()=>go('#about')},
    {g:'Navigate',t:'Contact',k:'hi say',a:()=>go('#contact')},
    {g:'Actions',t:'Message me on LinkedIn',k:'contact linkedin',a:()=>window.open(LINKEDIN,'_blank','noopener')},
    {g:'Actions',t:'Download résumé',k:'resume cv pdf',a:()=>window.open('assets/resume.pdf','_blank','noopener')},
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
  $('#openK').onclick=open;
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
