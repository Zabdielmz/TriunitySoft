'use strict';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const easeOut = 'cubic-bezier(.23, 1, .32, 1)';
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#nav-links');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
  menu.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  menu.classList.toggle('is-open', open);
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
window.matchMedia('(min-width: 621px)').addEventListener('change', closeMenu);

const projectGrid = document.querySelector('.project-grid');
const projectCards = [...document.querySelectorAll('.project')];
const filterButtons = [...document.querySelectorAll('[data-filter]')];
filterButtons.forEach(button => button.addEventListener('click', event => {
  const filter = button.dataset.filter;
  filterButtons.forEach(item => {
    item.classList.toggle('is-active', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
  projectGrid.classList.toggle('is-filtered', filter !== 'all');
  projectGrid.dataset.filter = filter;
  let count = 0;
  projectCards.forEach(card => {
    card.hidden = filter !== 'all' && card.dataset.category !== filter;
    if (!card.hidden) count++;
  });
  document.querySelector('.filter-status').textContent = `${count} ${count === 1 ? 'concepto visible' : 'conceptos visibles'}`;
  if (!reducedMotion.matches && event.detail > 0) {
    projectGrid.getAnimations().forEach(animation => animation.cancel());
    projectGrid.animate([{ opacity: .45, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 250, easing: easeOut });
  }
}));

const projectData = {
  nexo: { title: 'Nexo', description: 'Una exploración de cómo reunir proyectos, tareas y actividad en un espacio de trabajo claro. El concepto combina una interfaz serena con información fácil de encontrar y un lenguaje visual que ayuda a priorizar.', tags: ['Aplicación web', 'Experiencia de usuario', 'Datos de muestra'] },
  aether: { title: 'Aether', description: 'Un concepto de exploración que parte de una pregunta: ¿qué hay al otro lado? Una dirección visual de paisajes monumentales, luz y escala para imaginar un mundo que recompensa la curiosidad.', tags: ['Videojuego', 'Exploración', 'Arte conceptual'] },
  orbit: { title: 'Orbit', description: 'Una propuesta de aplicación de escritorio para dar espacio a las ideas y acompañarlas hasta su ejecución. Un tablero visual, estados claros y una interfaz que mantiene el foco en el siguiente paso.', tags: ['Escritorio', 'Productividad', 'Interfaz conceptual'] }
};
const dialog = document.querySelector('#project-dialog');
let dialogTrigger;
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  const key = button.dataset.project;
  const project = projectData[key];
  dialogTrigger = button;
  document.querySelector('#dialog-title').textContent = project.title;
  document.querySelector('#dialog-description').textContent = project.description;
  const tags = document.querySelector('#dialog-tags');
  tags.replaceChildren(...project.tags.map(label => { const tag = document.createElement('span'); tag.textContent = label; return tag; }));
  const source = document.querySelector(`.project-cover[data-project="${key}"]`);
  const preview = document.createElement('div');
  preview.className = source.className;
  preview.innerHTML = source.innerHTML;
  preview.setAttribute('aria-hidden', 'true');
  document.querySelector('#dialog-visual').replaceChildren(preview);
  document.querySelector('#dialog-contact').href = `mailto:triunity.dev@gmail.com?subject=${encodeURIComponent(`Una idea inspirada en ${project.title}`)}`;
  dialog.showModal();
  document.body.classList.add('dialog-open');
  document.querySelector('.dialog-close').focus();
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  dialogTrigger?.focus({ preventScroll: true });
});

document.querySelectorAll('[data-interest]').forEach(button => button.addEventListener('click', () => {
  const wasSelected = button.getAttribute('aria-pressed') === 'true';
  document.querySelectorAll('[data-interest]').forEach(item => item.setAttribute('aria-pressed', String(item === button && !wasSelected)));
  const interest = wasSelected ? '' : button.dataset.interest;
  const subject = interest ? `Hablemos de un proyecto: ${interest}` : 'Hablemos de un proyecto';
  const body = interest ? `Hola, Triunity. Me gustaría conversar sobre: ${interest.toLowerCase()}.\n\nMi idea es: ` : '';
  document.querySelector('#contact-email').href = `mailto:triunity.dev@gmail.com?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`;
  document.querySelector('#contact-helper').textContent = interest ? `Prepararemos el correo sobre: ${interest.toLowerCase()}.` : 'Abrirá tu aplicación de correo.';
}));
const copyButton = document.querySelector('#copy-email');
let copyTimeout;
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('triunity.dev@gmail.com');
    copyButton.innerHTML = 'Correo copiado <svg class="icon"><use href="#check"/></svg>';
    document.querySelector('#copy-status').textContent = 'Correo copiado al portapapeles.';
    clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => { copyButton.innerHTML = 'Copiar correo <svg class="icon"><use href="#copy"/></svg>'; }, 2500);
  } catch {
    document.querySelector('#copy-status').classList.remove('sr-only');
    document.querySelector('#copy-status').textContent = 'Puedes seleccionar y copiar triunity.dev@gmail.com directamente.';
  }
});

document.querySelectorAll('.service').forEach(details => details.addEventListener('toggle', () => {
  if (details.open) document.querySelectorAll('.service').forEach(other => { if (other !== details) other.open = false; });
}));

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (!reducedMotion.matches) entry.target.animate([{ opacity: .6, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 650, easing: easeOut });
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .12 });
  document.querySelectorAll('[data-reveal]').forEach(element => revealObserver.observe(element));
}

// Three colored surfaces travel around one trefoil. Geometry is precomputed;
// only projection and lighting run while the canvas is visible (at most 30 fps).
(() => {
  const canvas = document.querySelector('#unity-canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const motionButton = document.querySelector('#motion-toggle');
  const colors = [[211, 246, 107], [180, 171, 245], [255, 155, 133]];
  const segments = 144;
  const sides = 12;
  const vertices = [];
  const faces = [];
  const TAU = Math.PI * 2;
  const point = t => [(Math.sin(t) + 2 * Math.sin(2 * t)) * .55, (Math.cos(t) - 2 * Math.cos(2 * t)) * .55, -Math.sin(3 * t) * .55];
  const normalize = v => { const length = Math.hypot(...v); return v.map(x => x / length); };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  for (let i = 0; i < segments; i++) {
    const t = i / segments * TAU;
    const center = point(t);
    const next = point(t + .001);
    const tangent = normalize(next.map((v, k) => v - center[k]));
    const normal = normalize(cross(tangent, [0, 0, 1]));
    const binormal = cross(tangent, normal);
    for (let j = 0; j < sides; j++) {
      const angle = j / sides * TAU + t;
      const outward = normal.map((v, k) => v * Math.cos(angle) + binormal[k] * Math.sin(angle));
      vertices.push(center.map((v, k) => v + outward[k] * .24));
    }
  }
  for (let i = 0; i < segments; i++) for (let j = 0; j < sides; j++) {
    faces.push({ indices: [i * sides + j, ((i + 1) % segments) * sides + j, ((i + 1) % segments) * sides + (j + 1) % sides, i * sides + (j + 1) % sides], color: colors[Math.floor(j / 4)] });
  }
  let width = 0, height = 0, angle = .2, pointerX = 0, pointerY = 0, tiltX = 0, tiltY = 0;
  let paused = reducedMotion.matches, visible = true, frameId = 0, lastFrame = 0;
  function updateButton() {
    motionButton.setAttribute('aria-label', paused ? 'Activar animación' : 'Pausar animación');
    motionButton.querySelector('use').setAttribute('href', paused ? '#play' : '#pause');
  }
  function rotate(v, ax, ay) {
    const y = v[1] * Math.cos(ax) - v[2] * Math.sin(ax);
    const z = v[1] * Math.sin(ax) + v[2] * Math.cos(ax);
    return [v[0] * Math.cos(ay) + z * Math.sin(ay), y, -v[0] * Math.sin(ay) + z * Math.cos(ay)];
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const scale = Math.min(width, height) * .238;
    const transformed = vertices.map(v => rotate(v, -.35 + tiltY, angle + tiltX));
    const projected = transformed.map(v => {
      const perspective = 5 / (5 + v[2]);
      return [width / 2 + v[0] * scale * perspective, height * .47 + v[1] * scale * perspective];
    });
    const sorted = faces.map(face => ({ ...face, depth: face.indices.reduce((sum, index) => sum + transformed[index][2], 0) / 4 })).sort((a, b) => b.depth - a.depth);
    for (const face of sorted) {
      const [a, b, c] = face.indices.map(index => transformed[index]);
      const normal = normalize(cross(b.map((v, k) => v - a[k]), c.map((v, k) => v - a[k])));
      const light = Math.abs(normal[0] * -.35 + normal[1] * -.65 + normal[2] * -.68);
      const shade = .27 + .73 * light;
      const specular = Math.pow(light, 16) * 50;
      const rgb = face.color.map(v => Math.min(255, Math.round(v * shade + specular)));
      ctx.beginPath();
      face.indices.forEach((index, i) => { const p = projected[index]; if (i === 0) ctx.moveTo(...p); else ctx.lineTo(...p); });
      ctx.closePath();
      ctx.fillStyle = `rgb(${rgb.join(',')})`;
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = .6;
      ctx.fill();
      ctx.stroke();
    }
  }
  function tick(time) {
    frameId = 0;
    if (paused || !visible || document.hidden) return;
    if (time - lastFrame >= 32) {
      const delta = lastFrame ? Math.min(time - lastFrame, 60) : 32;
      lastFrame = time;
      angle += delta * .00012;
      tiltX += (pointerX - tiltX) * .08;
      tiltY += (pointerY - tiltY) * .08;
      draw();
    }
    frameId = requestAnimationFrame(tick);
  }
  function start() { if (!frameId && !paused && visible && !document.hidden) { lastFrame = 0; frameId = requestAnimationFrame(tick); } }
  function stop() { cancelAnimationFrame(frameId); frameId = 0; }
  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width; height = bounds.height;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }
  new ResizeObserver(resize).observe(canvas);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) start(); else stop(); }, { threshold: .05 }).observe(canvas);
  canvas.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || reducedMotion.matches || paused) return;
    const rect = canvas.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - .5) * .6;
    pointerY = ((event.clientY - rect.top) / rect.height - .5) * .4;
  });
  canvas.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
  motionButton.addEventListener('click', () => { paused = !paused; updateButton(); if (paused) stop(); else start(); });
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; updateButton(); if (paused) { stop(); tiltX = tiltY = 0; draw(); } else start(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
  updateButton(); resize(); start();
})();
