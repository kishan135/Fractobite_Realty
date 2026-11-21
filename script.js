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
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const params = new URLSearchParams(window.location.search);

  function initializeContactLinks() {
    document.querySelectorAll('[data-phone]').forEach((link) => {
      link.href = `tel:${contact.phone.replace(/\s/g, '')}`;
      if (link.hasAttribute('data-contact-text')) link.querySelector('span').textContent = contact.phone;
    });
    document.querySelectorAll('[data-email]').forEach((link) => {
      link.href = `mailto:${contact.email}`;
      link.querySelector('span').textContent = contact.email;
    });
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
    if (!image) return;
    const indicators = [...document.querySelectorAll('.hero-dots [aria-pressed]')];
    const autoplay = document.querySelector('.hero-autoplay');
    const slideInterval = 5500;
    let activeSlide = 0;
    let requestedSlide = 0;
    let requestId = 0;
    let timer;
    let paused = false;
    let outgoing;

    function scheduleSlide() {
      clearTimeout(timer);
      if (paused || reducedMotion.matches || document.hidden) return;

      timer = setTimeout(() => {
        const next = (requestedSlide + 1) % indicators.length;
        showSlide(next);
      }, slideInterval);
    }

    async function showSlide(index) {
      clearTimeout(timer);
      const currentRequest = ++requestId;
      requestedSlide = index;
      try {
        if (index === activeSlide) return;

        const incoming = new Image();
        incoming.src = `assets/hero/villa-${index + 1}.webp`;
        await incoming.decode();
        if (currentRequest !== requestId) return;

        outgoing?.remove();
        if (!reducedMotion.matches) {
          const previous = image.cloneNode();
          previous.classList.add('hero-image--outgoing');
          previous.removeAttribute('fetchpriority');
          previous.alt = '';
          previous.setAttribute('aria-hidden', 'true');
          image.after(previous);
          outgoing = previous;
          const fade = previous.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 650,
            easing: 'ease-in-out',
            fill: 'forwards',
          });
          fade.onfinish = () => previous.remove();
        }

        image.src = incoming.src;
        image.alt = slides[index];
        activeSlide = index;
        indicators.forEach((item, position) => item.setAttribute('aria-pressed', String(position === index)));
      } catch {
        // Keep the current slide if an image fails to load.
      } finally {
        if (currentRequest === requestId) scheduleSlide();
      }
    }

    function updateAutoplay() {
      autoplay.hidden = reducedMotion.matches;
      autoplay.textContent = paused ? '▶' : 'Ⅱ';
      autoplay.setAttribute('aria-label', paused ? 'Play automatic villa photos' : 'Pause automatic villa photos');
      if (reducedMotion.matches) outgoing?.remove();
      scheduleSlide();
    }

    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => showSlide(index));
    });
    autoplay.addEventListener('click', () => {
      paused = !paused;
      updateAutoplay();
    });
    reducedMotion.addEventListener('change', updateAutoplay);
    document.addEventListener('visibilitychange', scheduleSlide);
    updateAutoplay();
  }

  function initializePropertySearch() {
    const search = document.querySelector('#property-search');
    if (!search) return;

    const tabs = [...search.querySelectorAll('[data-type]')];
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        search.elements.type.value = tab.dataset.type;
        tabs.forEach((item) => item.setAttribute('aria-pressed', String(item === tab)));
      });
    });
  }

  function initializeCategoryCarousel() {
    const cards = document.querySelector('.property-cards');
    if (!cards) return;
    const previous = document.querySelector('.previous');
    const next = document.querySelector('.next');

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

  function selectFromUrl(select, name) {
    const value = params.get(name);
    if ([...select.options].some((option) => option.value === value)) select.value = value;
    return select.value;
  }

  function enquiryUrl(type, location) {
    const values = new URLSearchParams();
    if (type) values.set('type', type);
    if (location) values.set('location', location);
    return values.size ? `contact.html?${values}` : 'contact.html';
  }

  function initializeCatalog() {
    const form = document.querySelector('#catalog-filters');
    if (!form) return;

    const type = selectFromUrl(form.elements.type, 'type');
    const location = selectFromUrl(form.elements.location, 'location');
    const cards = [...document.querySelectorAll('[data-property-type]')];
    let matches = 0;
    cards.forEach((card) => {
      const category = card.dataset.propertyType;
      const markets = card.dataset.markets.split('|');
      const matchesLocation = !location || location === 'Across Gujarat' || markets.includes(location);
      card.hidden = Boolean((type && category !== type) || !matchesLocation);
      if (!card.hidden) matches += 1;
      card.querySelector('[data-property-inquiry]').href = enquiryUrl(category, location);
    });

    const label = matches === 1 ? 'category' : 'categories';
    document.querySelector('#catalog-status').textContent = `${matches} ${label}${location ? ` for ${location}` : ''}`;
    document.querySelector('#catalog-empty').hidden = matches !== 0;
    document.querySelector('#empty-inquiry').href = enquiryUrl(type, location);
  }

  function initializeLocations() {
    const location = params.get('location');
    document.querySelectorAll('[data-market]').forEach((item) => {
      if (item.dataset.market === location) item.open = true;
    });
  }

  function initializeInsights() {
    const filters = document.querySelector('#guide-filters');
    if (!filters) return;
    const search = filters.querySelector('[name="query"]');
    const topic = filters.querySelector('[name="topic"]');
    const guides = [...document.querySelectorAll('[data-topic]')];

    function filterGuides() {
      const terms = search.value.trim().toLowerCase().split(/\s+/);
      let matches = 0;
      guides.forEach((guide) => {
        const matchesTopic = !topic.value || guide.dataset.topic === topic.value;
        const text = guide.textContent.toLowerCase();
        guide.hidden = !matchesTopic || !terms.every((term) => text.includes(term));
        if (!guide.hidden) matches += 1;
      });
      document.querySelector('#guide-status').textContent = matches
        ? `${matches} ${matches === 1 ? 'guide' : 'guides'}`
        : 'No matching guides. Try another keyword or topic.';
    }

    search.addEventListener('input', filterGuides);
    topic.addEventListener('change', filterGuides);
    filterGuides();
  }

  function initializeEnquiry() {
    const form = document.querySelector('#enquiry-form');
    if (!form) return;

    selectFromUrl(form.elements.type, 'type');
    selectFromUrl(form.elements.location, 'location');
    const result = document.querySelector('#enquiry-result');
    const status = document.querySelector('#enquiry-status');
    const draft = document.querySelector('#enquiry-draft');

    form.addEventListener('input', () => { result.hidden = true; });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const fields = form.elements;
      const type = fields.type.selectedOptions[0].textContent.trim();
      const location = fields.location.selectedOptions[0].textContent.trim();
      const body = [
        `Name: ${fields.name.value.trim()}`,
        `Email: ${fields.email.value.trim()}`,
        `Property type: ${type}`,
        `Preferred location: ${location}`,
        '',
        fields.requirements.value.trim(),
      ].join('\r\n');
      const subject = encodeURIComponent('Property enquiry for Fractobite Realty');
      document.querySelector('#enquiry-email').href = `mailto:${contact.email}?subject=${subject}&body=${encodeURIComponent(body)}`;
      draft.value = body;
      result.hidden = false;
      status.textContent = 'Your draft is ready. Open your email app or copy the draft.';
      draft.focus();
    });

    form.hidden = false;
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
  initializeCatalog();
  initializeLocations();
  initializeInsights();
  initializeEnquiry();
  initializeDemoLinks();
})();
