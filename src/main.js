
let gsap=null, ScrollTrigger=null, THREE=null, animeAnimate=null;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function loadMotionLibs(){
  try {
    const [g, st, th, an] = await Promise.all([
      import('https://cdn.jsdelivr.net/npm/gsap@3.13.0/+esm'),
      import('https://cdn.jsdelivr.net/npm/gsap@3.13.0/ScrollTrigger/+esm'),
      import('https://cdn.jsdelivr.net/npm/three@0.180.0/+esm'),
      import('https://cdn.jsdelivr.net/npm/animejs@4.1.3/+esm')
    ]);
    gsap=g.default || g.gsap || g;
    ScrollTrigger=st.ScrollTrigger || st.default;
    THREE=th;
    animeAnimate=an.animate;
    if(gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  } catch (err) {
    console.warn('Motion libraries unavailable, falling back gracefully.', err);
  }
}

function initNav(){
  const btn=document.querySelector('.menu-btn');
  const menu=document.querySelector('.mobile-menu');
  if(btn&&menu){
    btn.addEventListener('click',()=>{
      const open=menu.style.display==='flex';
      menu.style.display=open?'none':'flex';
      btn.textContent=open?'Menu':'Close';
      document.body.style.overflow=open?'':'hidden';
    });
  }
  const header=document.querySelector('.site-header');
  let last=0;
  window.addEventListener('scroll',()=>{
    const y=window.scrollY;
    if(y>140 && y>last) header.style.transform='translateY(-120%)';
    else header.style.transform='translateY(0)';
    last=y;
  },{passive:true});
}

function initCursor(){
  const c=document.querySelector('.cursor');
  if(!c||reduced||matchMedia('(pointer:coarse)').matches) return;
  const pos={x:innerWidth/2,y:innerHeight/2}, cur={x:pos.x,y:pos.y};
  addEventListener('pointermove',e=>{pos.x=e.clientX;pos.y=e.clientY});
  if(gsap){
    gsap.ticker.add(()=>{cur.x+=(pos.x-cur.x)*.15;cur.y+=(pos.y-cur.y)*.15;gsap.set(c,{x:cur.x,y:cur.y});});
  } else {
    addEventListener('pointermove',e=>{c.style.left=e.clientX+'px';c.style.top=e.clientY+'px';});
  }
  document.querySelectorAll('[data-cursor]').forEach(el=>{
    el.addEventListener('mouseenter',()=>{c.classList.add('is-label');c.textContent=el.dataset.cursor || 'VIEW';});
    el.addEventListener('mouseleave',()=>{c.classList.remove('is-label');c.textContent='';});
  });
}

function initTransitions(){
  const panel=document.querySelector('.transition-panel');
  if(!panel) return;
  document.querySelectorAll('a[href]').forEach(a=>{
    const href=a.getAttribute('href');
    if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http') || a.target==='_blank') return;
    a.addEventListener('click',e=>{
      e.preventDefault();
      if(reduced || !gsap){ location.href=href; return; }
      gsap.timeline({onComplete:()=>location.href=href})
        .set(panel,{transformOrigin:'bottom'})
        .to(panel,{scaleY:1,duration:.42,ease:'power4.inOut'})
        .to(panel,{scaleY:0,transformOrigin:'top',duration:.42,ease:'power4.inOut',delay:.03});
    });
  });
}

function initLoader(){
  const loader=document.querySelector('.loader');
  if(!loader) return;
  if(reduced){
    document.documentElement.classList.remove('hm-intro');
    loader.remove();
    return;
  }
  // The intro is deliberately Home-only and once per browser tab/session.
  if(!document.documentElement.classList.contains('hm-intro')){
    loader.remove();
    return;
  }
  try{ sessionStorage.setItem('hm-intro-seen','1'); }catch(e){}
  // Keep it short: a signature, not a loading experience.
  window.setTimeout(()=>{
    loader.classList.add('is-leaving');
    window.setTimeout(()=>{
      document.documentElement.classList.remove('hm-intro');
      loader.remove();
    },430);
  },720);
}

function initReveals(){
  const items=[...document.querySelectorAll('.reveal')];
  if(reduced || !gsap || !ScrollTrigger){ items.forEach(el=>{el.style.opacity='1';el.style.transform='none';}); return; }
  items.forEach((el,i)=>{
    gsap.fromTo(el,{opacity:0,y:52,rotateX:8,filter:'blur(8px)'},{
      opacity:1,y:0,rotateX:0,filter:'blur(0px)',duration:.95,ease:'power3.out',
      scrollTrigger:{trigger:el,start:'top 86%',once:true},delay:(i%4)*.05
    });
  });
  gsap.utils.toArray('[data-parallax]').forEach(el=>gsap.to(el,{yPercent:-10,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:1}}));
}

function initTilt(){
  if(reduced || matchMedia('(pointer:coarse)').matches) return;
  const cards=document.querySelectorAll('.archive-card,.oss-card,.experiment,.outcome,.fact,.project-media,.portrait-placeholder,.repo-row');
  cards.forEach(card=>{
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(1200px) rotateX(${(-y*7).toFixed(2)}deg) rotateY(${(x*9).toFixed(2)}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave',()=>{ card.style.transform=''; });
  });
}

function createScene(host,{wire='#171713', ring='#d8ff3e', points='#32332b', variant='hero'}={}){
  if(!host || !THREE || reduced) return null;
  const canvasHolder=document.createElement('div');
  canvasHolder.className='section-webgl';
  Object.assign(canvasHolder.style,{position:'absolute',inset:'0',zIndex:'0',pointerEvents:'none'});
  if(!host.querySelector('canvas')) host.appendChild(canvasHolder);
  else return null;

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(44,host.clientWidth/host.clientHeight,.1,100);
  camera.position.set(0,0,variant==='compact'?8.2:7.2);
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.setSize(host.clientWidth,host.clientHeight);
  canvasHolder.appendChild(renderer.domElement);

  const root=new THREE.Group();
  scene.add(root);
  const geos=[new THREE.IcosahedronGeometry(2.1,2), new THREE.TorusKnotGeometry(1.65,.025,190,18,2,5)];
  const mesh=new THREE.Mesh(variant==='compact'?geos[1]:geos[0], new THREE.MeshBasicMaterial({color:wire,wireframe:true,transparent:true,opacity:variant==='compact'?.22:.17}));
  root.add(mesh);

  const torus=new THREE.Mesh(new THREE.TorusGeometry(variant==='compact'?2.5:3.2,.012,4,180), new THREE.MeshBasicMaterial({color:ring,transparent:true,opacity:.75}));
  torus.rotation.set(1.06,.32,.1);
  scene.add(torus);

  const count=variant==='compact'?580:900;
  const positions=new Float32Array(count*3);
  for(let i=0;i<count;i++){
    const r=(variant==='compact'?2.1:2.6)+Math.random()*(variant==='compact'?2.4:3.4), th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1);
    positions[i*3]=r*Math.sin(ph)*Math.cos(th);
    positions[i*3+1]=r*Math.sin(ph)*Math.sin(th);
    positions[i*3+2]=r*Math.cos(ph);
  }
  const pg=new THREE.BufferGeometry();
  pg.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const pts=new THREE.Points(pg,new THREE.PointsMaterial({color:points,size:variant==='compact'?.015:.014,transparent:true,opacity:.42}));
  scene.add(pts);

  const pointer={x:0,y:0};
  host.addEventListener('pointermove',e=>{
    const r=host.getBoundingClientRect();
    pointer.x=(e.clientX-r.left)/r.width-.5;
    pointer.y=(e.clientY-r.top)/r.height-.5;
  });
  let running=true;
  function render(){
    if(!running) return;
    root.rotation.y += variant==='compact' ? .001 : .0014;
    root.rotation.x += (pointer.y*.18-root.rotation.x)*.02;
    root.rotation.y += (pointer.x*.22)*.008;
    torus.rotation.z += variant==='compact' ? .0008 : .0011;
    pts.rotation.y -= .00034;
    renderer.render(scene,camera);
    requestAnimationFrame(render);
  }
  render();
  const resize=()=>{ camera.aspect=host.clientWidth/host.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(host.clientWidth,host.clientHeight); };
  addEventListener('resize',resize);
  if(ScrollTrigger){ ScrollTrigger.create({trigger:host,start:'top bottom',end:'bottom top',onLeave:()=>running=false,onEnterBack:()=>{if(!running){running=true; render();}}}); }
  return {renderer};
}

function initScenes(){
  createScene(document.querySelector('.hero-canvas'), {wire:'#11110f', ring:'#d8ff3e', points:'#3a3c34', variant:'hero'});
  createScene(document.querySelector('.lab-canvas'), {wire:'#f4f2eb', ring:'#d8ff3e', points:'#d8ff3e', variant:'compact'});
  ['.page-hero-rich','.about-hero-rich','.case-hero-rich'].forEach(sel=>{
    const section=document.querySelector(sel);
    if(section){
      const holder=document.createElement('div');
      holder.className='hero-canvas';
      Object.assign(holder.style,{position:'absolute',inset:'0',zIndex:'0',opacity:'.7'});
      section.prepend(holder);
      createScene(holder,{wire:'#161712', ring:'#d8ff3e', points:'#35362f', variant:'compact'});
    }
  });
}

function initHome(){
  if(document.body.dataset.page!=='home') return;
  if(!reduced && gsap){
    gsap.from('.hero-title .line > span',{yPercent:115,duration:1.1,ease:'power4.out',stagger:.09,delay:.18});
    gsap.from('.hero-topline,.hero-bottom',{opacity:0,y:26,duration:.82,ease:'power3.out',stagger:.12,delay:.45});
  }
  const track=document.querySelector('.cap-track');
  if(track && gsap && ScrollTrigger && !reduced){
    gsap.to(track,{xPercent:-28,ease:'none',scrollTrigger:{trigger:'.capabilities-band',start:'top bottom',end:'bottom top',scrub:1}});
  }
}

function initWorkFilters(){
  if(document.body.dataset.page!=='work') return;
  const buttons=[...document.querySelectorAll('.filter-btn')], cards=[...document.querySelectorAll('.archive-card')];
  buttons.forEach(btn=>btn.addEventListener('click',()=>{
    buttons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const f=btn.dataset.filter;
    cards.forEach((card,i)=>{
      const show=f==='all' || card.dataset.category===f;
      if(show){
        card.style.display='block';
        if(animeAnimate && !reduced) animeAnimate(card,{opacity:[0,1],scale:[.96,1],rotateX:[16,0],translateY:[22,0],duration:520,delay:i*55,ease:'outExpo'});
      } else {
        card.style.display='none';
      }
    });
    ScrollTrigger && ScrollTrigger.refresh();
  }));
}

function initCaseStudy(){
  if(document.body.dataset.page!=='case') return;
  const paths=[...document.querySelectorAll('.arch-svg .path')];
  paths.forEach(p=>{ const len=p.getTotalLength(); p.style.strokeDasharray=len; p.style.strokeDashoffset=len; });
  if(ScrollTrigger && animeAnimate){
    ScrollTrigger.create({trigger:'.arch-stage',start:'top 72%',once:true,onEnter:()=>paths.forEach((p,i)=>animeAnimate(p,{strokeDashoffset:0,duration:1200,delay:i*150,ease:'inOutSine'}))});
  } else { paths.forEach(p=>p.style.strokeDashoffset=0); }
  document.querySelectorAll('[data-counter]').forEach(el=>{
    const end=Number(el.dataset.counter);
    if(ScrollTrigger && animeAnimate){
      let obj={n:0};
      ScrollTrigger.create({trigger:el,start:'top 90%',once:true,onEnter:()=>animeAnimate(obj,{n:end,duration:1100,ease:'outExpo',onUpdate:()=>el.textContent=Math.round(obj.n)+(el.dataset.suffix||'')})});
    } else el.textContent=end + (el.dataset.suffix || '');
  });
}

function initAbout(){
  if(document.body.dataset.page!=='about') return;
  const progress=document.querySelector('.timeline-progress');
  if(progress && gsap && ScrollTrigger && !reduced){
    gsap.to(progress,{height:'100%',ease:'none',scrollTrigger:{trigger:'.timeline',start:'top 65%',end:'bottom 55%',scrub:true}});
  } else if(progress) progress.style.height='100%';
}

async function boot(){
  initLoader();
  const motionPromise=loadMotionLibs();
  await Promise.race([motionPromise, new Promise(r=>setTimeout(r,900))]);
  initNav();
  initCursor();
  initTransitions();
  initReveals();
  initTilt();
  initScenes();
  initHome();
  initWorkFilters();
  initCaseStudy();
  initAbout();
}
boot();
