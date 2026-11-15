(() => {
  'use strict';
  document.documentElement.classList.add('has-js');

  const config = window.SWAYMARK_CONFIG || {};
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-nav-list]');
  if (menuButton && menu) {
    const closeMenu = () => {
      menu.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      document.body.classList.remove('menu-open');
    };
    menuButton.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      document.body.classList.toggle('menu-open', open);
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
    document.addEventListener('click', event => { if (!menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu(); });
  }

  const email = typeof config.businessEmail === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.businessEmail.trim())
    ? config.businessEmail.trim() : '';
  document.querySelectorAll('[data-email-link]').forEach(link => {
    const wrapper = link.closest('[data-email-area]');
    if (email) {
      link.href = `mailto:${email}`;
      link.textContent = email;
      if (wrapper) wrapper.hidden = false;
    } else if (wrapper) {
      wrapper.hidden = true;
    }
  });

  document.querySelectorAll('[data-year]').forEach(node => { node.textContent = String(new Date().getFullYear()); });
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
      });
    }, { threshold: .08 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
  }

})();