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
