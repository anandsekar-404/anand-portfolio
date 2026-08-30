/* =====================================================================
   main.js — core site behaviour
   Mobile menu, scroll progress, active-nav highlighting, the
   IntersectionObserver reveal system, the contact form's mailto
   fallback, the marquee ticker, the cursor-follow spotlight glow on
   cards, the hero portrait's smooth glow-bloom entrance, the terminal
   typing line, and the hero particle-network canvas.
   Loaded before animations.js — defines `prefersReduced`, which
   animations.js also reads.
   ===================================================================== */

// ---------- shared reduced-motion flag (used by the GSAP/tilt blocks below) ----------
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- animate.css: header entrance + a single one-shot nudge on the Cybroatrix pill ----------
if(!prefersReduced){
  document.querySelector('header').classList.add('animate__animated','animate__fadeInDown');
  const navCta = document.querySelector('.nav-cta');
  if(navCta){
    setTimeout(()=>{
      navCta.classList.add('animate__animated','animate__heartBeat');
      navCta.addEventListener('animationend', ()=> navCta.classList.remove('animate__animated','animate__heartBeat'), {once:true});
    }, 2600);
  }
}

// ---------- mobile menu ----------
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const scrim = document.getElementById('scrim');
function closeMenu(){mobileMenu.classList.remove('open'); scrim.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false');}
function openMenu(){mobileMenu.classList.add('open'); scrim.classList.add('open'); menuBtn.setAttribute('aria-expanded','true');}
menuBtn.addEventListener('click', ()=> mobileMenu.classList.contains('open') ? closeMenu() : openMenu());
scrim.addEventListener('click', closeMenu);
document.querySelectorAll('#mobileMenu a').forEach(a=>a.addEventListener('click', closeMenu));

// ---------- scroll progress ----------
const progress = document.getElementById('progress');
window.addEventListener('scroll', ()=>{
  const h = document.documentElement;
  const pct = (h.scrollTop)/(h.scrollHeight - h.clientHeight) * 100;
  progress.style.width = pct + '%';
}, {passive:true});

// ---------- scroll to top ----------
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', ()=>{
  scrollTopBtn.classList.toggle('show', window.scrollY > 700);
}, {passive:true});
scrollTopBtn.addEventListener('click', ()=>{
  window.scrollTo({top:0, behavior: prefersReduced ? 'auto' : 'smooth'});
});

// ---------- active nav on scroll ----------
const navAnchors = document.querySelectorAll('[data-nav]');
const sections = [...navAnchors].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
function setActive(){
  let idx = 0;
  const y = window.scrollY + 140;
  sections.forEach((s,i)=>{ if(s.offsetTop <= y) idx = i; });
  navAnchors.forEach(a=>a.classList.remove('active'));
  const id = sections[idx] && '#'+sections[idx].id;
  document.querySelectorAll(`[data-nav][href="${id}"]`).forEach(a=>a.classList.add('active'));
}
window.addEventListener('scroll', setActive, {passive:true});
setActive();

// ---------- reveal on scroll ----------
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, {threshold:0.12});
revealEls.forEach(el=>io.observe(el));
window.__revealReady = true; // tells the inline safety-net script (index.html) this ran successfully

// ---------- marquee: duplicate content for seamless loop ----------
(function(){
  const track = document.getElementById('marqueeTrack');
  track.innerHTML += track.innerHTML;
})();

// ---------- spotlight mask: cursor-follow glow on cards ----------
(function(){
  const targets = document.querySelectorAll('.project-card, .hcard, .cert-card, .lead-card, .strength-chip, .contact-links a');
  targets.forEach(el=>{
    el.classList.add('spotlight');
    el.addEventListener('mousemove', e=>{
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX-r.left)+'px');
      el.style.setProperty('--my', (e.clientY-r.top)+'px');
    });
  });
})();

// ---------- hero portrait entrance ----------
// Handled entirely by CSS (@keyframes heroWrapFadeIn / heroCutoutRiseIn in
// animations.css) so it plays automatically on load with zero JS dependency —
// the photo can never get stuck invisible if a script fails to run.

// ---------- terminal typing line (Typed.js if loaded, else fallback) ----------
(function(){
  const el = document.getElementById('typedLine');
  const lines = [
    '> whoami — anand sekar, cybersecurity student',
    '> status — building TrustLink & Cybroatrix',
    '> mindset — learn, break, secure, repeat'
  ];
  if(window.Typed){
    new Typed('#typedLine', {strings:lines, typeSpeed:32, backSpeed:14, backDelay:1400, loop:true, smartBackspace:true});
  } else {
    let li=0, ci=0, deleting=false;
    (function tick(){
      const full = lines[li];
      el.textContent = deleting ? full.slice(0,ci--) : full.slice(0,ci++);
      let delay = deleting ? 22 : 34;
      if(!deleting && ci>full.length){deleting=true; delay=1200;}
      if(deleting && ci<0){deleting=false; li=(li+1)%lines.length; delay=300;}
      setTimeout(tick, delay);
    })();
  }
})();

// ---------- hero network canvas ----------
(function(){
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  let w,h,nodes;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize(){
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  function initNodes(){
    const count = Math.max(18, Math.min(42, Math.floor(w/45)));
    nodes = Array.from({length:count}, ()=>({
      x:Math.random()*w, y:Math.random()*h,
      vx:(Math.random()-0.5)*0.25, vy:(Math.random()-0.5)*0.25,
      r:Math.random()*1.6+0.8
    }));
  }
  window.addEventListener('resize', ()=>{resize(); initNodes();});
  resize(); initNodes();

  function draw(){
    ctx.clearRect(0,0,w,h);
    nodes.forEach(n=>{
      n.x += n.vx; n.y += n.vy;
      if(n.x<0||n.x>w) n.vx*=-1;
      if(n.y<0||n.y>h) n.vy*=-1;
    });
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i], b=nodes[j];
        const dx=a.x-b.x, dy=a.y-b.y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<130){
          ctx.strokeStyle = `rgba(0,229,255,${0.14*(1-dist/130)})`;
          ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    nodes.forEach(n=>{
      ctx.beginPath();
      ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
      ctx.fillStyle = 'rgba(0,229,255,0.55)';
      ctx.fill();
    });
    if(!reduced) requestAnimationFrame(draw);
  }
  draw();
})();
