// Robust, independent admin-dialog access via three VIA logo clicks.
(() => {
  'use strict';
  const logo = document.querySelector('footer.partners > img');
  const dialog = document.getElementById('admin-dialog');
  if (!logo || !dialog) return;
  let clicks = 0;
  let lastClick = 0;
  logo.style.cursor = 'default';
  logo.setAttribute('role', 'button');
  logo.setAttribute('tabindex', '0');
  logo.setAttribute('aria-label', 'Åbn administration med tre klik');
  function activate(event) {
    // Prevent the old listener from counting the same click twice.
    event.stopImmediatePropagation();
    const now = Date.now();
    if (now - lastClick > 4000) clicks = 0;
    lastClick = now;
    clicks += 1;
    if (clicks !== 3) return;
    clicks = 0;
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    const pin = document.getElementById('admin-pin');
    if (pin) window.aiPinFields?.focus('admin-pin');
  }
  logo.addEventListener('click', activate, true);
  logo.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate(event);
    }
  }, true);
})();
