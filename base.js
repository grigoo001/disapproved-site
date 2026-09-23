// Shared behaviour: reveal-on-scroll (design directions only) and email signup.
(() => {
  // Reveal: base.css only hides .reveal once <html> has the "js" class, so content
  // stays visible if this script never runs.
  const els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add('in'));
  }

  // Design-direction mockups: their forms are previews and must not claim success.
  document.querySelectorAll('form[data-signup]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = form.querySelector('[data-msg]') || form.parentElement.querySelector('[data-msg]');
      if (msg) msg.textContent = 'Design preview only. Nothing was sent.';
    });
  });

  // Real signup: <div data-signup> containing <form data-endpoint="...">.
  // With no endpoint the form stays hidden and the Instagram fallback is shown instead.
  document.querySelectorAll('div[data-signup]').forEach((box) => {
    const form = box.querySelector('form');
    const endpoint = form && form.dataset.endpoint;
    if (!endpoint) return;

    const input = form.querySelector('input[type="email"]');
    const button = form.querySelector('button[type="submit"]');
    const msg = form.querySelector('.msg');
    const label = button.textContent;
    box.classList.add('is-open');
    box.querySelectorAll('.open-only').forEach((el) => { el.hidden = false; });
    form.hidden = false;

    const say = (text, isError) => {
      msg.textContent = text;
      msg.classList.toggle('err', Boolean(isError));
      input.setAttribute('aria-invalid', isError ? 'true' : 'false');
    };
    const busy = (on) => {
      button.disabled = on;
      button.textContent = on ? 'Sending…' : label;
    };

    input.addEventListener('input', () => { if (msg.classList.contains('err')) say('', false); });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (button.disabled) return;
      input.value = input.value.trim();
      if (!input.value) return say('Enter your email address.', true), input.focus();
      if (!input.checkValidity()) return say('That email address looks incomplete. Check for a missing @ or domain.', true), input.focus();

      busy(true);
      say('', false);
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
          signal: ctrl.signal,
        });
        if (res.ok) {
          form.reset();
          say('You’re on the list. One email when stickers go live.', false);
        } else if (res.status === 429) {
          say('Too many tries. Wait a minute, then send it again.', true);
        } else if (res.status >= 400 && res.status < 500) {
          say('That address was not accepted. Check it and try again.', true);
        } else {
          say('Our signup service is having a moment. Your email is still here, so try again shortly.', true);
        }
      } catch (err) {
        say(err.name === 'AbortError'
          ? 'That took too long. Check your connection and try again.'
          : 'No connection. Your email is still here, so try again when you’re back online.', true);
      } finally {
        clearTimeout(timer);
        busy(false);
      }
    });
  });
})();
