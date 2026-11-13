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

  const form = document.querySelector('[data-enquiry-form]');
  if (form) {
    const status = document.querySelector('[data-form-status]');
    const setStatus = (message, isError = false) => {
      if (!status) return;
      status.textContent = message;
      status.classList.add('visible');
      status.classList.toggle('error', isError);
      status.setAttribute('role', 'status');
      status.focus({ preventScroll: true });
    };
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const clean = key => String(data.get(key) || '').trim().slice(0, 2000);
      const name = clean('name'), address = clean('email'), business = clean('business');
      const service = clean('service'), timeframe = clean('timeframe'), message = clean('message');
      const subject = `New project enquiry from ${name}`;
      const body = `Hello Janus,\n\nI'd like to talk about a project.\n\nName: ${name}\nEmail: ${address}\nBusiness: ${business || 'Not provided'}\nInterested in: ${service}\nTiming: ${timeframe || 'Flexible'}\n\nProject details:\n${message}\n\n— Prepared on the SWAYMARK website (please press Send)`;
      if (email) {
        setStatus('An email draft should open in your email application. Review it and press Send to complete your enquiry. If nothing opens, please email janusoosthuizen2@gmail.com directly.');
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      } else {
        const copyText = `${subject}\n\n${body}`;
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(copyText);
            setStatus('Preview mode: your enquiry has been copied to your clipboard. No message has been sent. Add an approved business email to assets/config.js before launch.');
          } else {
            const textArea = document.createElement('textarea');
            textArea.value = copyText; textArea.style.position = 'fixed'; textArea.style.left = '-9999px';
            document.body.appendChild(textArea); textArea.select();
            const copied = document.execCommand('copy'); textArea.remove();
            if (copied) setStatus('Preview mode: your enquiry was copied to your clipboard. No message has been sent. Add an approved business email before launch.');
            else setStatus(`Preview mode: no message has been sent. Copy your enquiry and send it manually:\n\n${copyText}`);
          }
        } catch {
          setStatus(`Preview mode: no message has been sent. Copy your enquiry and send it manually:\n\n${copyText}`);
        }
      }
    });
  }
})();