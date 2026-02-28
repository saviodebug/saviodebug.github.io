// Pequenas interações: menu móvel, cursor customizado, tilt simples
(function(){
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');
  if(burger && nav){
    // mobile off-canvas behaviour
    burger.addEventListener('click', ()=>{
      if(window.innerWidth > 820){
        // desktop: fallback toggle
        nav.style.display = nav.style.display === 'flex' ? '' : 'flex';
        return;
      }
      // ensure nav has offcanvas class
      nav.classList.add('offcanvas-nav');
      // if nav is inside header, move it to body so it sits above backdrop and is clickable
      if(!nav.__moved && nav.parentElement && nav.parentElement.tagName.toLowerCase() !== 'body'){
        nav.__originalParent = nav.parentElement;
        nav.__nextSibling = nav.nextSibling;
        document.body.appendChild(nav);
        nav.__moved = true;
      }
      const isOpen = nav.classList.contains('open');
      if(!isOpen){
        nav.classList.add('open');
          showBackdrop();
          // prevent body scroll while open
          document.documentElement.style.overflow = 'hidden';
          document.body.style.overflow = 'hidden';
      } else {
        nav.classList.remove('open');
          hideBackdrop();
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';
      }
    });
    window.addEventListener('resize', ()=>{
      if(window.innerWidth>820){ 
        nav.style.display='flex'; 
        nav.classList.remove('open'); 
        hideBackdrop(); 
        // if nav was moved to body, restore to original parent for desktop layout
        if(nav.__moved){
          if(nav.__originalParent){
            if(nav.__nextSibling) nav.__originalParent.insertBefore(nav, nav.__nextSibling);
            else nav.__originalParent.appendChild(nav);
          }
          nav.__moved = false;
        }
      }
    });
  }

  // header hide on scroll for mobile
  (function(){
    let lastY = window.scrollY || 0;
    let ticking = false;
    const headerEl = document.querySelector('header');
    // Use a slightly larger threshold but smoother response
    function onScroll(){
      const y = window.scrollY || 0;
      const navEl = document.querySelector('.nav.offcanvas-nav');
      const navOpen = navEl && navEl.classList.contains('open');
      if(navOpen) return; // don't hide while menu open
      const delta = y - lastY;
      // only toggle when user scrolls meaningfully to avoid flicker
      if(delta > 12 && y > 60){
        headerEl && headerEl.classList.add('hidden');
      } else if(delta < -12){
        headerEl && headerEl.classList.remove('hidden');
      }
      lastY = y;
      ticking = false;
    }
    window.addEventListener('scroll', ()=>{
      if(!ticking){ requestAnimationFrame(onScroll); ticking = true; }
    }, {passive:true});
  })();

  // removed custom cursor behavior (no visual cursor dot)

  // small tilt effect for .card
  const cards = document.querySelectorAll('.card');
  cards.forEach(card=>{
    card.addEventListener('mousemove', (e)=>{
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) translateY(-6px) rotateX(${ -y * 6 }deg) rotateY(${ x * 8 }deg)`;
    });
    card.addEventListener('mouseleave', ()=>{ card.style.transform='none'; });
  });

  // removed floating blob behavior (no follow-mouse blob)

  /* Off-canvas backdrop helpers */
  function showBackdrop(){
    let back = document.querySelector('.offcanvas-backdrop');
    if(!back){ back = document.createElement('div'); back.className = 'offcanvas-backdrop'; document.body.appendChild(back); }
    // force reflow then show
    requestAnimationFrame(()=> back.classList.add('visible'));
    back.addEventListener('click', onBackdropClick);
    // close with Escape
    document.addEventListener('keydown', onKeyDownClose);
  }
  function hideBackdrop(){
    const back = document.querySelector('.offcanvas-backdrop');
    if(!back) return;
    back.classList.remove('visible');
    back.removeEventListener('click', onBackdropClick);
    document.removeEventListener('keydown', onKeyDownClose);
  }
  function onBackdropClick(){
    const nav = document.querySelector('.nav.offcanvas-nav');
    if(nav) nav.classList.remove('open');
    hideBackdrop();
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  function onKeyDownClose(e){
    if(e.key === 'Escape' || e.key === 'Esc'){
      const nav = document.querySelector('.nav.offcanvas-nav');
      if(nav && nav.classList.contains('open')){
        nav.classList.remove('open');
        hideBackdrop();
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }
    }
  }

  // accessible keyboard focus for cards
  cards.forEach(card=>{
    card.addEventListener('focus', ()=>{ card.classList.add('focused'); });
    card.addEventListener('blur', ()=>{ card.classList.remove('focused'); });
  });
})();
