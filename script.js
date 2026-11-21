(() => {
  'use strict';

  // Reference contact placeholders. Replace these with verified details before publication.
  const contact = {
    phone: '+91 98765 43210',
    email: 'info@fractobiterealty.com',
  };

  const slides = [
    'Contemporary glass-front villa with a reflecting pool at dusk',
    'White two-story villa beside a pool at sunset',
    'Contemporary villa with golden interior lighting at twilight',
    'Dark stone villa and a swimming pool at dusk',
  ];

  const nav = document.querySelector('.site-nav');
  const menu = document.querySelector('.menu-button');
  const search = document.querySelector('#property-search');
  const location = search.elements.location;
  const searchStatus = search.querySelector('.search-status');
  const tabs = [...search.querySelectorAll('[data-type]')];
  const cards = document.querySelector('.property-cards');
  const previous = document.querySelector('.previous');
  const next = document.querySelector('.next');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let selectedType = 'Buy';

  function initializeContactLinks() {
    document.querySelectorAll('[data-phone]').forEach((link) => {
      link.href = `tel:${contact.phone.replace(/\s/g, '')}`;
      if (link.hasAttribute('data-contact-text')) link.querySelector('span').textContent = contact.phone;
    });
    const email = document.querySelector('[data-email]');
    email.href = `mailto:${contact.email}`;
    email.querySelector('span').textContent = contact.email;
  }

  function setMenu(open) {
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  }

  function initializeMobileNavigation() {
    menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a, button')) setMenu(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menu.focus();
      }
    });
  }

  function initializeHeroSlider() {
    const image = document.querySelector('.hero-image');
    const indicators = [...document.querySelectorAll('.hero-dots button')];
    let requestedSlide = 0;

    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', async () => {
        requestedSlide = index;
        const path = `assets/hero/villa-${index + 1}.webp`;
        const incoming = new Image();
        incoming.src = path;
        try {
          await incoming.decode();
        } catch {
          return;
        }
        if (requestedSlide !== index) return;

        image.src = path;
        image.alt = slides[index];
        indicators.forEach((item, position) => item.setAttribute('aria-pressed', String(position === index)));
        if (!reducedMotion.matches) image.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 260 });
      });
    });
  }

  function selectPropertyType(type) {
    selectedType = type;
    tabs.forEach((tab) => tab.setAttribute('aria-pressed', String(tab.dataset.type === type)));
    searchStatus.textContent = '';
  }

  function focusSearch() {
    search.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center' });
    location.focus({ preventScroll: true });
  }

  function initializePropertySearch() {
    tabs.forEach((tab) => tab.addEventListener('click', () => selectPropertyType(tab.dataset.type)));
    location.addEventListener('change', () => { searchStatus.textContent = ''; });
    search.addEventListener('submit', (event) => {
      event.preventDefault();
      searchStatus.textContent = `Demo search for ${selectedType} in ${location.value}. Contact us to discuss available properties.`;
    });

    document.querySelectorAll('[data-location]').forEach((button) => {
      button.addEventListener('click', () => {
        location.value = button.dataset.location;
        searchStatus.textContent = `${location.value} selected. Choose a property type or search now.`;
        focusSearch();
      });
    });

    document.querySelectorAll('[data-category]').forEach((button) => {
      button.addEventListener('click', () => {
        selectPropertyType(button.dataset.category);
        searchStatus.textContent = `${selectedType} selected. Choose a location to search.`;
        focusSearch();
      });
    });
  }

  function initializeCategoryCarousel() {
    function updateControls() {
      previous.disabled = cards.scrollLeft < 2;
      next.disabled = cards.scrollLeft >= cards.scrollWidth - cards.clientWidth - 2;
    }

    function move(direction) {
      const first = cards.firstElementChild;
      const step = first.getBoundingClientRect().width + parseFloat(getComputedStyle(cards).columnGap);
      const position = Math.round(cards.scrollLeft / step);
      cards.scrollTo({ left: (position + direction) * step, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }

    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    cards.addEventListener('scroll', updateControls, { passive: true });
    new ResizeObserver(updateControls).observe(cards);
    updateControls();
  }

  function initializeNavigationState() {
    const links = [...nav.querySelectorAll('a[href^="#"]')];
    const sections = links.map((link) => document.querySelector(link.hash))
      .sort((first, second) => first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
    const footer = document.querySelector('#contact');

    function update() {
      const threshold = innerHeight * .38;
      let active = sections[0];
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= threshold) active = section;
      });
      const footerVisible = footer.getBoundingClientRect().bottom <= innerHeight + 2;
      if (footerVisible) active = footer;
      links.forEach((link) => {
        if (link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }

    document.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  function initializeDemoLinks() {
    const dialog = document.querySelector('.demo-dialog');
    document.querySelectorAll('[data-demo]').forEach((button) => {
      button.addEventListener('click', () => {
        dialog.querySelector('h2').textContent = button.dataset.demo;
        dialog.showModal();
      });
    });
  }

  initializeContactLinks();
  initializeMobileNavigation();
  initializeHeroSlider();
  initializePropertySearch();
  initializeCategoryCarousel();
  initializeNavigationState();
  initializeDemoLinks();
})();
