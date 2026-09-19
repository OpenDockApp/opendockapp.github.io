const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealElements = document.querySelectorAll<HTMLElement>('.reveal');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.1 });
  revealElements.forEach((element) => { element.classList.add('will-reveal'); observer.observe(element); });
}
const dock = document.querySelector<HTMLElement>('.dock');
const presets: Record<string, string[]> = {
  everyday: ['clock', 'date', 'apps', 'stats'],
  focus: ['clock', 'focus', 'stats'],
  creative: ['playing', 'date', 'apps'],
};
const descriptions: Record<string, string> = {
  everyday: 'Everyday layout: clock, date, app launcher, and system stats.',
  focus: 'Deep work layout: clock, focus timer, and system stats.',
  creative: 'Creative layout: now playing, date, and app launcher.',
};
document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((button) => {
  button.addEventListener('click', () => {
    const preset = button.dataset.preset!;
    document.querySelectorAll('[data-preset]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    dock?.querySelectorAll<HTMLElement>('.dock-tile').forEach((tile) => {
      const index = presets[preset].findIndex((name) => tile.classList.contains(`${name}-tile`));
      tile.hidden = index === -1;
      tile.style.order = String(index);
    });
    const status = document.getElementById('demo-status');
    if (status) status.textContent = descriptions[preset];
    if (!reducedMotion.matches) dock?.animate([{ opacity: 0.4, transform: 'translateY(9px) scale(.98)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 350, easing: 'cubic-bezier(.2,.7,.2,1)' });
  });
});
