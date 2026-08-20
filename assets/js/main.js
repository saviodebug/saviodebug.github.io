(function(){
  const pageOrder = {
    '/': 0,
    '/en/': 0,
    '/skills/': 1,
    '/en/skills/': 1,
    '/project/': 2,
    '/en/project/': 2,
    '/contact/': 3,
    '/en/contact/': 3
  };
  const storedDirection = sessionStorage.getItem('pageTransitionDirection');
  if(storedDirection === 'backward' || storedDirection === 'forward'){
    document.documentElement.classList.add(`page-enter-${storedDirection}`);
    sessionStorage.removeItem('pageTransitionDirection');
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  initNetworkBackground();
  initProjectModals();

  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');
  if(burger && nav){
    burger.addEventListener('click', ()=>{
      if(window.innerWidth > 820){
        nav.style.display = nav.style.display === 'flex' ? '' : 'flex';
        return;
      }
      nav.classList.add('offcanvas-nav');
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

  (function(){
    let lastY = window.scrollY || 0;
    let ticking = false;
    const headerEl = document.querySelector('header');
    function onScroll(){
      const y = window.scrollY || 0;
      const navEl = document.querySelector('.nav.offcanvas-nav');
      const navOpen = navEl && navEl.classList.contains('open');
      if(navOpen) return;
      const delta = y - lastY;
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

  document.addEventListener('click', (event)=>{
    if(!event.target.closest) return;
    const link = event.target.closest('a[href]');
    if(!link || event.defaultPrevented || event.button !== 0) return;
    if(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if(link.target && link.target !== '_self') return;
    if(link.hasAttribute('download')) return;

    let url;
    try{
      url = new URL(link.href, window.location.href);
    } catch(_err){
      return;
    }

    const samePage = url.pathname === window.location.pathname && url.search === window.location.search;
    if(url.origin !== window.location.origin || samePage) return;
    if(reduceMotion.matches || document.documentElement.classList.contains('is-page-leaving-forward') || document.documentElement.classList.contains('is-page-leaving-backward')) return;

    event.preventDefault();
    const currentPage = getPagePath(window.location.pathname);
    const targetPage = getPagePath(url.pathname);
    const currentIndex = pageOrder[currentPage];
    const targetIndex = pageOrder[targetPage];
    const direction = currentIndex !== undefined && targetIndex !== undefined && targetIndex < currentIndex ? 'backward' : 'forward';
    const navEl = document.querySelector('.nav.offcanvas-nav');
    if(navEl) navEl.classList.remove('open');
    hideBackdrop();
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    sessionStorage.setItem('pageTransitionDirection', direction);
    document.documentElement.classList.add(`is-page-leaving-${direction}`);

    window.setTimeout(()=>{
      window.location.href = url.href;
    }, 260);
  });

  const motionCards = document.querySelectorAll('.card, .skill-panel, .contact-card, .social');
  motionCards.forEach(card=>{
    card.addEventListener('mousemove', (e)=>{
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const moveX = x * 14;
      const moveY = y * 8;
      card.style.transform = `perspective(900px) translate(${moveX}px, ${moveY - 5}px) rotateX(${ -y * 5 }deg) rotateY(${ x * 7 }deg)`;
    });
    card.addEventListener('mouseleave', ()=>{ card.style.transform='none'; });
  });

  function showBackdrop(){
    let back = document.querySelector('.offcanvas-backdrop');
    if(!back){ back = document.createElement('div'); back.className = 'offcanvas-backdrop'; document.body.appendChild(back); }
    requestAnimationFrame(()=> back.classList.add('visible'));
    back.addEventListener('click', onBackdropClick);
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

  function getPagePath(pathname){
    let pagePath = pathname.replace(/\/index\.html$/, '/');
    if(!pagePath.endsWith('/')) pagePath = `${pagePath}/`;
    return pagePath;
  }

  function initNetworkBackground(){
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if(!ctx) return;

    canvas.className = 'network-bg';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let points = [];
    let animationFrame = 0;
    const mouse = {x:null,y:null};

    function resize(){
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(document.documentElement.clientWidth, window.innerWidth);
      height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, window.innerHeight);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const density = Math.min(width < 640 ? 72 : 150, Math.max(width < 640 ? 42 : 86, Math.round((width * height) / 24000)));
      points = Array.from({length:density}, ()=>({
        x:Math.random() * width,
        y:Math.random() * height,
        vx:(Math.random() - 0.5) * 0.28,
        vy:(Math.random() - 0.5) * 0.28,
        r:Math.random() * 1.5 + 0.45
      }));
      draw();
    }

    function draw(){
      ctx.clearRect(0, 0, width, height);
      const maxDistance = width < 640 ? 104 : 152;
      const mouseDistance = width < 640 ? 170 : 240;

      for(const point of points){
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(226, 242, 255, 0.76)';
        ctx.fill();
      }

      for(let i = 0; i < points.length; i++){
        const a = points[i];
        for(let j = i + 1; j < points.length; j++){
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.hypot(dx, dy);
          if(distance < maxDistance){
            const alpha = (1 - distance / maxDistance) * 0.16;
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        if(mouse.x !== null){
          const dx = a.x - mouse.x;
          const dy = a.y - mouse.y;
          const distance = Math.hypot(dx, dy);
          if(distance < mouseDistance){
            const alpha = (1 - distance / mouseDistance) * 0.42;
            ctx.strokeStyle = `rgba(125, 211, 252, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    }

    function tick(){
      for(const point of points){
        point.x += point.vx;
        point.y += point.vy;

        if(point.x < -20) point.x = width + 20;
        if(point.x > width + 20) point.x = -20;
        if(point.y < -20) point.y = height + 20;
        if(point.y > height + 20) point.y = -20;
      }
      draw();
      if(!document.hidden){
        animationFrame = requestAnimationFrame(tick);
      }
    }

    function start(){
      cancelAnimationFrame(animationFrame);
      resize();
      if(!document.hidden) tick();
    }

    window.addEventListener('resize', resize);
    window.addEventListener('load', resize);
    window.addEventListener('pageshow', start);
    document.addEventListener('visibilitychange', ()=>{
      if(document.hidden){
        cancelAnimationFrame(animationFrame);
      } else {
        start();
      }
    });
    window.addEventListener('pointermove', (event)=>{
      mouse.x = event.clientX;
      mouse.y = event.clientY + window.scrollY;
    }, {passive:true});
    window.addEventListener('pointerleave', ()=>{
      mouse.x = null;
      mouse.y = null;
    });
    start();
  }

  function initProjectModals(){
    const triggers = document.querySelectorAll('[data-project-modal]');
    if(!triggers.length) return;

    const closeModal = ()=>{
      const activeModal = document.querySelector('.project-modal.is-open');
      if(!activeModal) return;
      activeModal.classList.remove('is-open');
      activeModal.hidden = true;
      document.body.classList.remove('modal-open');
    };

    triggers.forEach(trigger=>{
      trigger.addEventListener('click', ()=>{
        const modal = document.getElementById(`project-modal-${trigger.dataset.projectModal}`);
        if(!modal) return;
        modal.hidden = false;
        document.body.classList.add('modal-open');
        requestAnimationFrame(()=> modal.classList.add('is-open'));
        const closeButton = modal.querySelector('[data-modal-close]');
        if(closeButton) closeButton.focus({preventScroll:true});
      });
    });

    document.addEventListener('click', (event)=>{
      if(event.target.matches('[data-modal-close]') || event.target.matches('.project-modal')){
        closeModal();
      }
    });

    document.addEventListener('keydown', (event)=>{
      if(event.key === 'Escape') closeModal();
    });
  }

  motionCards.forEach(card=>{
    card.addEventListener('focus', ()=>{ card.classList.add('focused'); });
    card.addEventListener('blur', ()=>{ card.classList.remove('focused'); });
  });
})();
