const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#nav-links');

if (menuButton && menu) {
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menú');
    menu.classList.remove('is-open');
  };

  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.classList.toggle('is-open', open);
  });

  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
}

const workbench = document.querySelector('.capability-workbench');
if (workbench) {
  const choices = [...workbench.querySelectorAll('.capability-choice')];
  const views = [...workbench.querySelectorAll('[data-view]')];
  const copies = [...workbench.querySelectorAll('[data-copy]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  choices.forEach((choice) => {
    choice.addEventListener('click', (event) => {
      const selected = choice.dataset.capability;
      if (selected === workbench.dataset.active) return;

      workbench.dataset.active = selected;
      choices.forEach((item) => {
        const active = item === choice;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });

      [...views, ...copies].forEach((item) => {
        item.hidden = (item.dataset.view ?? item.dataset.copy) !== selected;
      });

      if (event.detail > 0 && !reducedMotion.matches) {
        const nextView = views.find((item) => item.dataset.view === selected);
        const nextCopy = copies.find((item) => item.dataset.copy === selected);
        [nextView, nextCopy].forEach((item) => item.animate(
          [{ opacity: .5, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 280, easing: 'cubic-bezier(.23, 1, .32, 1)' }
        ));
      }
    });
  });
}

if ('IntersectionObserver' in window) {
  const steps = document.querySelectorAll('.approach-step');
  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-current', entry.isIntersecting));
  }, { rootMargin: '-35% 0px -35% 0px' });
  steps.forEach((step) => stepObserver.observe(step));

  const about = document.querySelector('.about');
  if (about) {
    const aboutObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        about.classList.add('is-visible');
        aboutObserver.disconnect();
      }
    }, { threshold: .3 });
    aboutObserver.observe(about);
  }
}
