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
      if (link.hasAttribute('data-contact-text')) {
        const value = link.querySelector('[data-contact-value]') ?? link.querySelector('span');
        value.textContent = contact.phone;
      }
    });
    document.querySelectorAll('[data-email]').forEach((link) => {
      link.href = `mailto:${contact.email}`;
      const value = link.querySelector('[data-contact-value]') ?? link.querySelector('span');
      value.textContent = contact.email;
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
    const slideInterval = 2500;
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
          previous.addEventListener('animationend', () => previous.remove(), { once: true });
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

  function initializeCatalogCarousel() {
    const carousel = document.querySelector('.catalog-hero');
    if (!carousel) return;

    const photos = [...carousel.querySelectorAll('.catalog-slide')];
    const indicators = [...carousel.querySelectorAll('[data-slide]')];
    const autoplay = carousel.querySelector('.catalog-autoplay');
    let current = 0;
    let requestId = 0;
    let target = 0;
    let timer;
    let paused = false;
    let hovering = false;
    let touchStart;

    function prepare(index) {
      const photo = photos[index];
      if (!photo.hasAttribute('src')) photo.src = photo.dataset.src;
      return photo.decode();
    }

    function nextIndex(index, step = 1) {
      return (index + step + photos.length) % photos.length;
    }

    function schedule() {
      clearTimeout(timer);
      if (paused || hovering || touchStart || carousel.matches(':focus-within') || document.hidden || reducedMotion.matches) return;
      timer = setTimeout(() => show(nextIndex(target)), 5000);
    }

    async function show(index) {
      clearTimeout(timer);
      const request = ++requestId;
      target = index;
      try {
        await prepare(index);
        if (request !== requestId) return;

        if (index !== current) {
          carousel.querySelector('.catalog-slide.is-previous')?.classList.remove('is-previous');
          photos[current].classList.remove('is-current', 'is-entering');
          if (!reducedMotion.matches) {
            photos[current].classList.add('is-previous');
            photos[index].classList.add('is-entering');
          }
        }
        indicators[current].setAttribute('aria-pressed', 'false');
        photos[index].classList.add('is-current');
        indicators[index].setAttribute('aria-pressed', 'true');
        current = index;
      } catch {
        // Keep the current photo visible if the requested photo fails.
      } finally {
        if (request === requestId) {
          if (!reducedMotion.matches) prepare(nextIndex(index)).catch(() => {});
          schedule();
        }
      }
    }

    function updateAutoplay() {
      autoplay.hidden = reducedMotion.matches;
      autoplay.textContent = paused ? '▶' : 'Ⅱ';
      autoplay.setAttribute('aria-label', paused ? 'Play automatic property photos' : 'Pause automatic property photos');
      if (reducedMotion.matches) {
        carousel.querySelector('.catalog-slide.is-previous')?.classList.remove('is-previous');
        photos[current].classList.remove('is-entering');
      } else {
        prepare(nextIndex(current)).catch(() => {});
      }
      schedule();
    }

    photos.forEach((photo) => {
      photo.addEventListener('animationend', (event) => {
        if (event.animationName !== 'motion-fade' || !photo.classList.contains('is-current')) return;
        photo.classList.remove('is-entering');
        carousel.querySelector('.catalog-slide.is-previous')?.classList.remove('is-previous');
      });
    });

    carousel.querySelector('.catalog-prev').addEventListener('click', () => show(nextIndex(target, -1)));
    carousel.querySelector('.catalog-next').addEventListener('click', () => show(nextIndex(target)));
    indicators.forEach((button, index) => button.addEventListener('click', () => show(index)));
    autoplay.addEventListener('click', () => {
      paused = !paused;
      updateAutoplay();
    });

    carousel.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse') hovering = true;
      schedule();
    });
    carousel.addEventListener('pointerleave', () => {
      hovering = false;
      schedule();
    });
    carousel.addEventListener('focusin', schedule);
    carousel.addEventListener('focusout', () => queueMicrotask(schedule));
    carousel.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'touch' || !event.isPrimary || event.target.closest('button')) return;
      touchStart = { x: event.clientX, y: event.clientY };
      schedule();
    });
    carousel.addEventListener('pointerup', (event) => {
      if (!touchStart || !event.isPrimary) return;
      const dx = event.clientX - touchStart.x;
      const dy = event.clientY - touchStart.y;
      touchStart = undefined;
      if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) show(nextIndex(target, dx < 0 ? 1 : -1));
      else schedule();
    });
    carousel.addEventListener('pointercancel', () => {
      touchStart = undefined;
      schedule();
    });

    reducedMotion.addEventListener('change', updateAutoplay);
    document.addEventListener('visibilitychange', schedule);
    carousel.querySelector('.catalog-carousel-controls').hidden = false;
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
    const offers = [...document.querySelectorAll('[data-offer-type]')];
    const count = offers.filter((section) => {
      const markets = section.dataset.markets.split('|');
      const matchesLocation = !location || location === 'Across Gujarat' || markets.includes(location);
      const matchesType = !type || section.dataset.offerType === type;
      section.hidden = !matchesType || !matchesLocation;
      return !section.hidden;
    }).length;
    document.querySelector('#top-offers').hidden = count === 0;
    document.querySelector('#catalog-empty').hidden = count !== 0;

    const label = count === 1 ? 'category' : 'categories';
    document.querySelector('#catalog-status').textContent = type || location
      ? `${count} ${label}${location ? ` for ${location}` : ''}`
      : '';
    document.querySelector('#empty-inquiry').href = enquiryUrl(type, location);

    document.querySelectorAll('[data-catalog-enquiry]').forEach((link) => {
      const url = new URL(link.href);
      if (type && !url.searchParams.has('type')) url.searchParams.set('type', type);
      if (location) url.searchParams.set('location', location);
      link.href = url.href;
    });
    if (location) document.querySelectorAll('.offer-view-all').forEach((link) => {
      const url = new URL(link.href);
      url.searchParams.set('location', location);
      link.href = url.href;
    });
  }

  function initializeLocations() {
    const directory = document.querySelector('.market-directory');
    if (!directory) return;
    const entries = [...directory.querySelectorAll('[data-market]')];

    function openLinkedMarket() {
      const hash = window.location.hash;
      const market = entries.find((entry) => hash
        ? `#${entry.id}` === hash
        : entry.dataset.market === params.get('location'));
      if (market) market.open = true;
    }

    openLinkedMarket();
    window.addEventListener('hashchange', openLinkedMarket);
    document.querySelector('.market-highlight-grid').addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (link?.hash === window.location.hash) openLinkedMarket();
    });
  }

  function initializeInsights() {
    const filters = document.querySelector('#guide-filters');
    if (!filters) return;
    const search = filters.querySelector('[name="query"]');
    const topic = filters.querySelector('[name="topic"]');
    const guides = [...document.querySelectorAll('[data-topic]')].map((card) => ({
      card,
      text: [card.dataset.topic, card.querySelector('h3').textContent, card.querySelector('details p').textContent].join(' ').toLowerCase(),
    }));
    const status = document.querySelector('#guide-status');

    function filterGuides() {
      const query = search.value.trim().toLowerCase();
      const terms = query ? query.split(/\s+/) : [];
      let matches = 0;
      guides.forEach(({ card, text }) => {
        const matchesTopic = !topic.value || card.dataset.topic === topic.value;
        card.hidden = !matchesTopic || !terms.every((term) => text.includes(term));
        if (!card.hidden) matches += 1;
      });
      if (!query && !topic.value) status.textContent = '';
      else if (matches) status.textContent = `${matches} ${matches === 1 ? 'guide' : 'guides'}`;
      else status.textContent = 'No guides found. Try another search or topic.';
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
    const project = params.get('project');
    const enquiryProjects = ['Aakruti Green', 'Balaji Upvan', 'Balaji Upvan 5 Star Villa', 'Mirrikh Group'];
    if (enquiryProjects.includes(project)) {
      form.elements.requirements.value = `I would like to enquire about ${project}.`;
    }
    const result = document.querySelector('#enquiry-result');
    const status = document.querySelector('#enquiry-status');
    const draft = document.querySelector('#enquiry-draft');

    const phone = form.elements.phone;
    phone.addEventListener('input', () => phone.setCustomValidity(''));
    form.addEventListener('input', () => { result.hidden = true; });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formattedPhone = phone.value.trim();
      const phoneShape = formattedPhone.replace(/[ .-]/g, '');
      const digits = phoneShape.replace(/[^0-9]/g, '');
      if (!/^\+?(?:[0-9]|\([0-9]{1,5}\))+$/.test(phoneShape) || digits.length < 7 || digits.length > 15) {
        phone.setCustomValidity('Enter a valid phone number with 7 to 15 digits.');
        phone.reportValidity();
        return;
      }
      const fields = form.elements;
      const type = fields.type.selectedOptions[0].textContent.trim();
      const location = fields.location.selectedOptions[0].textContent.trim();
      const body = [
        `Name: ${fields.name.value.trim()}`,
        `Phone: ${formattedPhone}`,
        `Email: ${fields.email.value.trim()}`,
        `Property type: ${type}`,
        `Preferred location: ${location}`,
      ];
      const requirements = fields.requirements.value.trim();
      if (requirements) body.push('', requirements);
      const draftBody = body.join('\r\n');
      const subject = encodeURIComponent('Property enquiry for Fractobite Realty');
      document.querySelector('#enquiry-email').href = `mailto:${contact.email}?subject=${subject}&body=${encodeURIComponent(draftBody)}`;
      draft.value = draftBody;
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

  function initializeContentMotion() {
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

    // Reveal a card or group as a unit instead of animating its children twice.
    const groups = [
      '.motion-intro', 'article', '.benefit', '.about-collage-frame', '.about-stats > div',
      '.footer-grid > *', '.location-options > li', '.disclosure-list > details',
      '.page-panel', 'form', '.contact-action', '.insight-filters',
    ].join(', ');
    const items = 'h1, h2, h3, h4, h5, h6, p, img:not(.hero-image), .button';
    const groupPositions = new Map();
    const revealPositions = new WeakMap();
    const viewportHeight = document.documentElement.clientHeight;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        observer.unobserve(target);
        if (reducedMotion.matches || target.matches(':focus-within')) return;

        if (target.matches('img') && !target.complete) {
          target.addEventListener('load', () => {
            if (!reducedMotion.matches) observer.observe(target);
          }, { once: true });
          return;
        }

        target.style.setProperty('--motion-order', revealPositions.get(target));
        target.classList.add('motion-reveal');

        const finish = (event) => {
          if (event.target !== target || event.animationName !== 'motion-rise') return;
          target.classList.remove('motion-reveal');
          target.removeEventListener('animationend', finish);
          target.removeEventListener('animationcancel', finish);
        };
        target.addEventListener('animationend', finish);
        target.addEventListener('animationcancel', finish);
      });
    });

    document.querySelectorAll(`main :is(${groups}, ${items}), .site-footer :is(${groups})`).forEach((item) => {
      const group = item.closest(groups);
      if (group && group !== item) return;
      if (item.matches('.motion-intro')) return;

      const bounds = item.getBoundingClientRect();
      if (bounds.bottom > 0 && bounds.top < viewportHeight && bounds.right > 0 && bounds.left < innerWidth) return;

      const parent = item.parentElement;
      const position = groupPositions.get(parent) ?? 0;
      groupPositions.set(parent, position + 1);
      revealPositions.set(item, Math.min(position, 3));
      observer.observe(item);
    });

    reducedMotion.addEventListener('change', ({ matches }) => {
      if (!matches) return;
      observer.disconnect();
      document.querySelectorAll('.motion-reveal').forEach((item) => item.classList.remove('motion-reveal'));
    });
  }

  initializeContactLinks();
  initializeMobileNavigation();
  initializeHeroSlider();
  initializeCatalogCarousel();
  initializePropertySearch();
  initializeCategoryCarousel();
  initializeCatalog();
  initializeLocations();
  initializeInsights();
  initializeEnquiry();
  initializeDemoLinks();
  initializeContentMotion();
})();
