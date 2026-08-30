/* =====================================================================
   animations.js — third-party animation library orchestration
   AOS, Vanilla-Tilt, and GSAP/ScrollTrigger/SplitType setup: the hero
   split-text intro, the word-level text-reveal-mask on every section
   heading, the cinematic hero->about pinned slide transition, and the
   four rotating per-section entrance flavours.
   Loaded after main.js (uses its `prefersReduced` flag).
   ===================================================================== */

// ---------- AOS: scroll reveals for cards not already using .reveal timing ----------
document.querySelectorAll('.cert-card, .lead-card, .strength-chip, .chip, .next-item').forEach((el,i)=>{
  el.setAttribute('data-aos', el.classList.contains('strength-chip') ? 'zoom-in' : 'fade-up');
  el.setAttribute('data-aos-delay', String((i%6)*60));
});
if(window.AOS){
  AOS.init({duration:600, once:true, offset:60, easing:'ease-out-cubic', disable: prefersReduced ? true : false});
} else {
  // AOS's CSS hides [data-aos] elements by default — if the JS failed to load
  // (offline CDN, blocked script, etc.) this keeps content visible instead of stuck at opacity:0.
  document.documentElement.classList.add('no-aos');
}

// ---------- vanilla-tilt: 3D tilt on hero photo + project cards ----------
// Skipped on touch devices and under reduced-motion: tilt is a hover-only flourish, not core content.
const isTouch = window.matchMedia('(hover:none)').matches;
if(window.VanillaTilt && !isTouch && !prefersReduced){
  document.querySelectorAll('.project-card').forEach(el=>{
    el.setAttribute('data-tilt',''); el.setAttribute('data-tilt-max','4');
    el.setAttribute('data-tilt-speed','500'); el.setAttribute('data-tilt-glare','');
    el.setAttribute('data-tilt-max-glare','0.08');
  });
  VanillaTilt.init(document.querySelectorAll('[data-tilt]'));
}

// ---------- GSAP: hero split-text stagger, cinematic section transitions, text-reveal masks ----------
if(window.gsap && window.SplitType && window.ScrollTrigger){
  gsap.registerPlugin(ScrollTrigger);

  if(prefersReduced){
    // Respect the OS-level preference: skip pinning/staggering entirely and just
    // make sure everything is in its resting, fully-visible state.
    gsap.set('.section-title, .skill-chips > *, section.section-pad .wrap', {opacity:1, clearProps:'transform,filter'});
  } else {
    const split = new SplitType('#heroTitle', {types:'words,chars'});
    gsap.set(split.chars, {opacity:0, y:24, rotateX:-40});
    gsap.to(split.chars, {opacity:1, y:0, rotateX:0, duration:0.7, stagger:0.018, ease:'power3.out', delay:0.15,
      onComplete:()=>{
        // a single, brief glitch flicker on the name once it's finished typing in — used once, not looped
        const heroTitle = document.getElementById('heroTitle');
        if(heroTitle){ heroTitle.classList.add('glitch-once','play'); }
      }
    });

    // -------- text reveal mask: every section heading splits into words that rise up
    //          out of a hidden strip (classic overflow-hidden + translateY text mask) --------
    gsap.utils.toArray('.section-title').forEach(title=>{
      title.classList.add('split-parent');
      const t = new SplitType(title, {types:'words'});
      gsap.fromTo(t.words,
        {opacity:0, yPercent:100},
        {opacity:1, yPercent:0, duration:0.65, stagger:0.06, ease:'power3.out',
          scrollTrigger:{trigger:title, start:'top 85%'}}
      );
    });

    gsap.utils.toArray('.skill-chips').forEach(group=>{
      gsap.fromTo(group.children, {opacity:0, y:14, scale:0.9}, {
        opacity:1, y:0, scale:1, duration:0.45, stagger:0.04, ease:'back.out(1.6)',
        scrollTrigger:{trigger:group, start:'top 90%'}
      });
    });

    // -------- cinematic entrance for every section, rotating through four flavours
    //          (rise+scale, clip-path wipe, blur-to-clear zoom, skew-slide) so the page doesn't
    //          repeat the same motion twice in a row. Plain, easy native scroll otherwise —
    //          no pinning or scroll-jacking. --------
    const flavours = [
      { from:{opacity:0, y:90, scale:0.92, rotateX:6, transformOrigin:'50% 100%'},
        to:{opacity:1, y:0, scale:1, rotateX:0} },
      { from:{opacity:0, clipPath:'inset(0 0 0 100%)'},
        to:{opacity:1, clipPath:'inset(0 0 0 0%)'} },
      { from:{opacity:0, scale:0.9},
        to:{opacity:1, scale:1} },
      { from:{opacity:0, x:-70, skewX:4},
        to:{opacity:1, x:0, skewX:0} }
    ];
    gsap.utils.toArray('section.section-pad .wrap').forEach((wrap,i)=>{
      const f = flavours[i % flavours.length];
      gsap.fromTo(wrap, f.from, {...f.to, duration:1, ease:'power3.out',
        scrollTrigger:{trigger:wrap, start:'top 82%'}});
    });
  }
}

