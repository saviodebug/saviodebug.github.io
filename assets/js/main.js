const english = document.documentElement.lang === 'en';
const words = (pt, en) => english ? en : pt;
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.mobile-nav');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', words('Abrir menu', 'Open menu'));
  menu.hidden = true;
  document.body.classList.remove('menu-open');
}
menuButton?.addEventListener('click', () => {
  const opening = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? words('Fechar menu', 'Close menu') : words('Abrir menu', 'Open menu'));
  menu.hidden = !opening;
  document.body.classList.toggle('menu-open', opening);
});
menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
const desktop = matchMedia('(min-width: 801px)');
desktop.addEventListener('change', event => { if (event.matches) closeMenu(); });
// Preserve the current section when changing the page language.
document.querySelectorAll('.language-switch a').forEach(link => {
  link.addEventListener('click', () => { link.hash = location.hash; });
});
const navLinks = [...document.querySelectorAll('.desktop-nav a')];
const sections = [...document.querySelectorAll('main > section[id], footer[id]')];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => {
      if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-20% 0px -55% 0px', threshold: 0 });
sections.forEach(section => sectionObserver.observe(section));
const copyButton = document.querySelector('.copy-email');
if (copyButton && navigator.clipboard?.writeText) {
  copyButton.hidden = false;
  copyButton.addEventListener('click', async () => {
    const status = document.querySelector('.copy-status');
    try {
      await navigator.clipboard.writeText('busanasavio@gmail.com');
      status.textContent = words('Email copiado.', 'Email copied.');
    } catch {
      status.textContent = words('Copie o endereço de email acima.', 'Copy the email address above.');
    }
  });
}
const visual = document.querySelector('.hero-visual');
if (visual) {
  document.body.prepend(visual);
  visual.classList.add('world-viewport');
  const controls = visual.querySelector('.scene-tools');
  if (controls) { controls.classList.add('world-tools'); document.body.append(controls); }
}
const host = document.querySelector('#code-scene');
let sceneController = null;
let sceneLoading = false;
async function loadScene() {
  if (!host || sceneController || sceneLoading) return;
  sceneLoading = true;
  try {
    const { mountScene } = await import('./hero-scene.bundle.js?v=world-v1');
    sceneController = mountScene(host, { english });
  } catch (error) {
    // The poster remains visible and the content works if WebGL or its module is unavailable.
    host.dataset.state = 'fallback';
    console.info('3D unavailable; static artwork retained.', error.message);
  } finally { sceneLoading = false; }
}
loadScene();
window.addEventListener('pagehide', () => {
  sceneController?.destroy();
  sceneController = null;
  sectionObserver.disconnect();
});
window.addEventListener('pageshow', event => {
  if (event.persisted) {
    sections.forEach(section => sectionObserver.observe(section));
    loadScene();
  }
});
if (!document.documentElement.classList.contains('intro-pending')) document.documentElement.dataset.ready = '1';
// Theme selection is local to the visitor and applied before styles load.
const themeToggle = document.querySelector('.theme-toggle');
function syncTheme() {
  const dark = document.documentElement.dataset.theme !== 'light';
  themeToggle.hidden = false;
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute('aria-label', dark ? words('Ativar modo claro', 'Switch to light theme') : words('Ativar modo escuro', 'Switch to dark theme'));
  themeToggle.querySelector('span').textContent = dark ? words('Escuro', 'Dark') : words('Claro', 'Light');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#050913' : '#e5eaf4');
}
if (themeToggle) {
  syncTheme();
  themeToggle.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('savio-theme', theme); } catch { /* Private browsers can disable storage. */ }
    syncTheme();
    document.dispatchEvent(new Event('portfolio:theme'));
  });
}

const filterGroup = document.querySelector('.project-filters');
const projectRows = [...document.querySelectorAll('.project-row')];
function filterProjects(category) {
  const valid = ['all', 'desktop', 'automation', 'web'];
  if (!valid.includes(category)) return;
  let count = 0;
  projectRows.forEach(row => {
    row.hidden = category !== 'all' && row.dataset.category !== category;
    if (!row.hidden) { count++; row.classList.add('is-visible'); }
  });
  filterGroup.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  document.querySelector('.project-count').textContent = english ? `${count} public project${count === 1 ? '' : 's'}` : `${count} projeto${count === 1 ? '' : 's'} público${count === 1 ? '' : 's'}`;
  refreshProjectJourney();
}
if (filterGroup) {
  filterGroup.hidden = false;
  filterGroup.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (button) filterProjects(button.dataset.filter);
  });
}

// Reveal content once; movement never gates access to a project or its links.
const storyTargets = [...document.querySelectorAll('.section-heading, .terminal-intro, .terminal-window, .about-portrait, .about-content, .contact-heading, .contact-bottom')];
storyTargets.forEach((target, index) => {
  target.classList.add('reveal-block');
  target.style.setProperty('--reveal-delay', `${(index % 2) * 90}ms`);
});
const revealTargets = [...document.querySelectorAll('.project-row, .stack-group, .experience'), ...storyTargets];
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
  });
}, { threshold: .08 });
function configureReveal() {
  document.body.classList.add('motion-enabled');
}
revealTargets.forEach(target => revealObserver.observe(target));
configureReveal();

const terminalForm = document.querySelector('.terminal-form');
const terminalOutput = document.querySelector('.terminal-output');
const terminalInput = document.querySelector('#terminal-command');
const commandHistory = [];
let historyPosition = 0;
function terminalLine(text, className = '') {
  const line = document.createElement('p');
  if (className) line.className = className;
  line.textContent = text;
  terminalOutput.append(line);
  return line;
}
function terminalLink(label, href) {
  const line = document.createElement('p');
  const link = document.createElement('a');
  link.href = href;
  link.textContent = label;
  line.append(link);
  terminalOutput.append(line);
}
function runCommand(raw) {
  const command = raw.trim().toLowerCase();
  if (!command) return;
  commandHistory.push(raw.trim());
  historyPosition = commandHistory.length;
  terminalLine(`❯ ${raw.trim()}`, 'terminal-echo');
  switch (command) {
    case 'help':
      terminalLine(words('projects  projetos e código público', 'projects  public projects and source'));
      terminalLine(words('stack     linguagens e ferramentas', 'stack     languages and tools'));
      terminalLine(words('whoami    nome, graduação e trabalho', 'whoami    name, studies, and work'));
      terminalLine(words('contact   email e redes profissionais', 'contact   email and professional profiles'));
      terminalLine(words('open yoshi | bot | confereai — abrir projeto', 'open yoshi | bot | confereai — open a project'));
      terminalLine(words('clear     limpar terminal', 'clear     clear terminal'));
      break;
    case 'projects':
    case 'ls':
      terminalLink('YOSHI Control Studio / Windows', '#project-yoshi');
      terminalLink('YoshiBot / Python + Discord', '#project-bot');
      terminalLink('ConfereAí / Node.js + Manifest V3', '#project-confere');
      filterProjects('all');
      break;
    case 'stack':
      terminalLine('Python · Node.js · JavaScript · Express · discord.py');
      terminalLine('Supabase · PostgreSQL · SQL · Linux · Git');
      terminalLine(words('Em estudo: Java / POO, C++ / CMake; experiências locais com Rust.', 'Studying: Java / OOP, C++ / CMake; local experience with Rust.'));
      terminalLink(words('Ver todas as tecnologias', 'See all technologies'), '#stack');
      break;
    case 'whoami':
      terminalLine('Savio Busana Beckhauser Junior', 'term-accent');
      terminalLine(words('Estagiário de TI — Elastri Engenharia.', 'IT intern — Elastri Engenharia.'));
      terminalLine(words('Anteriormente: estágio de TI no Colégio Jardim Anchieta.', 'Previously: IT internship at Colégio Jardim Anchieta.'));
      terminalLine(words('Ciência da Computação — Univali, em andamento.', 'Computer Science — Univali, in progress.'));
      break;
    case 'contact':
      terminalLink('busanasavio@gmail.com', 'mailto:busanasavio@gmail.com');
      terminalLink('LinkedIn / saviojunior', 'https://www.linkedin.com/in/saviojunior/');
      terminalLink('GitHub / saviodebug', 'https://github.com/saviodebug');
      break;
    case 'clear':
      terminalOutput.replaceChildren();
      break;
    case 'open yoshi':
    case 'open bot':
    case 'open confereai': {
      const id = command === 'open yoshi' ? 'yoshi' : command === 'open bot' ? 'bot' : 'confere';
      filterProjects('all');
      const row = document.getElementById(`project-${id}`);
      row.querySelector('details').open = true;
      location.hash = `project-${id}`;
      terminalLine(words('Projeto aberto na página.', 'Project opened on the page.'));
      break;
    }
    default:
      terminalLine(words('Comando não encontrado. Digite help.', 'Command not found. Type help.'));
  }
  // Keep the live log bounded during long sessions.
  while (terminalOutput.children.length > 70) terminalOutput.firstElementChild.remove();
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
  terminalInput.value = '';
}
if (terminalForm && terminalInput && terminalOutput) {
  terminalForm.hidden = false;
  document.querySelector('.terminal-shortcuts').hidden = false;
  terminalForm.addEventListener('submit', event => { event.preventDefault(); runCommand(terminalInput.value); });
  document.querySelectorAll('[data-command]').forEach(button => button.addEventListener('click', () => runCommand(button.dataset.command)));
  terminalInput.addEventListener('keydown', event => {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    historyPosition = Math.max(0, Math.min(commandHistory.length, historyPosition + (event.key === 'ArrowUp' ? -1 : 1)));
    terminalInput.value = commandHistory[historyPosition] || '';
  });
  terminalOutput.addEventListener('click', event => { if (event.target.closest('a[href^="#project-"]')) filterProjects('all'); });
}

// The canvas owns the spatial journey; HTML remains the source for content and links.
function refreshProjectJourney() {
  document.body.classList.add('world-ready');
  document.dispatchEvent(new Event('portfolio:layout'));
}
addEventListener('resize', refreshProjectJourney, { passive: true });
document.querySelectorAll('.project-details').forEach(details => details.addEventListener('toggle', refreshProjectJourney));
refreshProjectJourney();

// This CSS 3D object remains interactive even when a browser cannot create WebGL.
const cube = document.querySelector('.stack-cube');
const universe = document.querySelector('.stack-universe');
let cubeX = 0, cubeY = 0;
if (cube && universe) {
  universe.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const rect = universe.getBoundingClientRect();
    cubeX = ((event.clientY - rect.top) / rect.height - .5) * -24;
    cubeY = ((event.clientX - rect.left) / rect.width - .5) * 40;
    cube.style.setProperty('--cube-x', `${cubeX}deg`);
    cube.style.setProperty('--cube-y', `${cubeY}deg`);
  }, { passive: true });
  cube.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') cubeY -= 20;
    if (event.key === 'ArrowRight') cubeY += 20;
    if (event.key === 'ArrowUp') cubeX -= 15;
    if (event.key === 'ArrowDown') cubeX += 15;
    cube.style.setProperty('--cube-x', `${cubeX}deg`);
    cube.style.setProperty('--cube-y', `${cubeY}deg`);
  });
}

// Opening sequence: the name arrives first; the world follows without locking native scrolling.
async function playOpening() {
  const root = document.documentElement;
  const heading = document.querySelector('.hero h1');
  const panel = document.querySelector('.hero-inner');
  if (scrollY > 16 || !root.classList.contains('intro-pending') || !heading || !panel || !heading.animate) {
    root.classList.remove('intro-pending');
    root.dataset.ready = '1';
    root.dataset.intro = 'complete';
    return;
  }
  await Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 450))]);
  if (!root.classList.contains('intro-pending')) return;
  root.classList.remove('intro-pending');
  root.classList.add('intro-running');
  root.dataset.intro = 'name';
  const target = heading.getBoundingClientRect();
  const stageRect = panel.getBoundingClientRect();
  const x = stageRect.left + stageRect.width / 2 - (target.left + target.width / 2);
  const y = stageRect.top + stageRect.height * .45 - (target.top + target.height / 2);
  const scale = Math.min(innerWidth < 600 ? 1.2 : 1.55, stageRect.width * .82 / target.width, stageRect.height * .6 / target.height);
  const animation = heading.animate([
    { transform: `translate3d(${x}px,${y}px,0) scale(${scale})`, offset: 0 },
    { transform: `translate3d(${x}px,${y}px,0) scale(${scale})`, offset: .35 },
    { transform: 'translate3d(0,0,0) scale(1)', offset: 1 }
  ], { duration: 1850, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
  let completed = false;
  const revealTimer = setTimeout(() => {
    root.classList.add('intro-details');
    root.dataset.intro = 'world';
  }, 850);
  const finishTimer = setTimeout(finish, 2350);
  function finish() {
    if (completed) return;
    completed = true;
    clearTimeout(revealTimer);
    clearTimeout(finishTimer);
    animation.cancel();
    root.classList.remove('intro-pending', 'intro-running', 'intro-details');
    root.dataset.intro = 'complete';
    root.dataset.ready = '1';
    refreshProjectJourney();
    removeEventListener('wheel', finish);
    removeEventListener('touchstart', finish);
    removeEventListener('scroll', skipOnScroll);
    removeEventListener('keydown', skipOnKey);
  }
  function skipOnScroll() { if (scrollY > 16) finish(); }
  function skipOnKey(event) { if (['ArrowDown', 'PageDown', ' ', 'End'].includes(event.key)) finish(); }
  addEventListener('wheel', finish, { passive: true, once: true });
  addEventListener('touchstart', finish, { passive: true, once: true });
  addEventListener('scroll', skipOnScroll, { passive: true });
  addEventListener('keydown', skipOnKey);
}
playOpening();

// A deliberate extra scroll at the end closes the journey and opens it again.
const loopCurtain = document.createElement('div');
loopCurtain.className = 'journey-loop';
loopCurtain.setAttribute('aria-hidden', 'true');
loopCurtain.innerHTML = '<span class="loop-orbit"></span><span class="loop-name">Savio Junior<span>_</span></span>';
document.body.append(loopCurtain);
let loopBusy = false, bottomSince = 0, loopDistance = 0, touchOrigin = null;
const atEnd = () => scrollY + innerHeight >= document.documentElement.scrollHeight - 4;
function returnThroughPortal() {
  if (loopBusy) return;
  loopBusy = true;
  document.body.classList.add('world-returning');
  document.dispatchEvent(new Event('portfolio:reenter'));
  loopCurtain.classList.add('is-active');
  setTimeout(() => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    scrollTo({ top: 0, behavior: 'instant' });
    root.style.scrollBehavior = previous;
    document.querySelector('.hero h1')?.focus({ preventScroll: true });
    root.classList.add('intro-pending');
    playOpening();
    loopCurtain.classList.remove('is-active');
    document.body.classList.remove('world-returning');
  }, 1300);
  setTimeout(() => { loopBusy = false; bottomSince = 0; loopDistance = 0; }, 4300);
}
addEventListener('scroll', () => {
  if (!atEnd()) { bottomSince = 0; loopDistance = 0; }
  else if (!bottomSince) bottomSince = performance.now();
}, { passive: true });
addEventListener('wheel', event => {
  if (event.ctrlKey || event.target.closest?.('input, textarea, .terminal-output') || !atEnd() || loopBusy) return;
  if (event.deltaY <= 0) { loopDistance = 0; return; }
  if (!bottomSince) { bottomSince = performance.now(); return; }
  if (performance.now() - bottomSince < 650) return;
  loopDistance += event.deltaY;
  if (loopDistance > 160) returnThroughPortal();
}, { passive: true });
addEventListener('touchstart', event => {
  touchOrigin = atEnd() ? event.touches[0].clientY : null;
}, { passive: true });
addEventListener('touchend', event => {
  if (touchOrigin !== null && touchOrigin - event.changedTouches[0].clientY > 80 && atEnd()) returnThroughPortal();
  touchOrigin = null;
}, { passive: true });
document.querySelectorAll('.footer-line a[href="#inicio"]').forEach(link => {
  link.addEventListener('click', event => { event.preventDefault(); returnThroughPortal(); });
});

const worldRail = document.createElement('nav');
worldRail.className = 'world-rail';
worldRail.setAttribute('aria-label', words('Etapas da viagem', 'Journey chapters'));
[['inicio','00'],['project-yoshi','01'],['project-bot','02'],['project-confere','03'],['stack','04'],['sobre','05'],['contato','06']].forEach(([id,number]) => {
  const target = document.getElementById(id);
  const link = document.createElement('a');
  link.href = `#${id}`;
  link.textContent = number;
  link.setAttribute('aria-label', target?.querySelector('h1,h2,h3')?.textContent || id);
  worldRail.append(link);
});
document.body.append(worldRail);
const chapterObserver = new IntersectionObserver(entries => {
  const current = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
  if (!current) return;
  worldRail.querySelectorAll('a').forEach(link => {
    if (link.hash === `#${current.target.id}`) link.setAttribute('aria-current','step');
    else link.removeAttribute('aria-current');
  });
}, {rootMargin:'-20% 0px -30% 0px',threshold:[0,.2,.5]});
worldRail.querySelectorAll('a').forEach(link => chapterObserver.observe(document.getElementById(link.hash.slice(1))));
document.querySelectorAll('.social-links a,.email-link').forEach((link,index) => {
  ['pointerenter','focus'].forEach(event => link.addEventListener(event, () => {
    document.dispatchEvent(new CustomEvent('portfolio:constellation',{detail:index}));
  }));
});
