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
const host = document.querySelector('#code-scene');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let sceneController = null;
let sceneLoading = false;
async function loadScene() {
  if (!host || reducedMotion.matches || sceneController || sceneLoading) return;
  sceneLoading = true;
  try {
    const { mountScene } = await import('./hero-scene.bundle.js');
    if (!reducedMotion.matches) sceneController = mountScene(host, { english });
  } catch (error) {
    // The poster remains visible and the content works if WebGL or its module is unavailable.
    host.dataset.state = 'fallback';
    console.info('3D unavailable; static artwork retained.', error.message);
  } finally { sceneLoading = false; }
}
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    sceneController?.destroy();
    sceneController = null;
  } else loadScene();
});
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
document.documentElement.dataset.ready = '1';
// Theme selection is local to the visitor and applied before styles load.
const themeToggle = document.querySelector('.theme-toggle');
function syncTheme() {
  const dark = document.documentElement.dataset.theme !== 'light';
  themeToggle.hidden = false;
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute('aria-label', dark ? words('Ativar modo claro', 'Switch to light theme') : words('Ativar modo escuro', 'Switch to dark theme'));
  themeToggle.querySelector('span').textContent = dark ? words('Escuro', 'Dark') : words('Claro', 'Light');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#101214' : '#f3f5f7');
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
}
if (filterGroup) {
  filterGroup.hidden = false;
  filterGroup.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (button) filterProjects(button.dataset.filter);
  });
}

// Reveal content once; movement never gates access to a project or its links.
const revealTargets = [...document.querySelectorAll('.project-row, .stack-group, .experience')];
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
  });
}, { threshold: .08 });
function configureReveal() {
  document.body.classList.toggle('motion-enabled', !reducedMotion.matches);
  if (reducedMotion.matches) revealTargets.forEach(target => target.classList.add('is-visible'));
}
revealTargets.forEach(target => revealObserver.observe(target));
configureReveal();
reducedMotion.addEventListener('change', configureReveal);

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
