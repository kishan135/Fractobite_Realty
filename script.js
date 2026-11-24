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
  const mobileNav = window.matchMedia('(max-width: 767px)');
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
    nav.inert = mobileNav.matches && !open;
  }

  function initializeMobileNavigation() {
    const isOpen = () => menu.getAttribute('aria-expanded') === 'true';
    setMenu(false);
    menu.addEventListener('click', (event) => {
      const open = !isOpen();
      setMenu(open);
      if (open && mobileNav.matches && event.detail === 0) {
        nav.querySelector('a')?.focus({ preventScroll: true });
      }
    });
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a, button')) setMenu(false);
    });
    document.addEventListener('pointerdown', (event) => {
      if (mobileNav.matches && isOpen() && !nav.contains(event.target) && !menu.contains(event.target)) {
        setMenu(false);
      }
    });
    document.addEventListener('focusin', (event) => {
      if (mobileNav.matches && isOpen() && !menu.closest('.site-header').contains(event.target)) setMenu(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) {
        setMenu(false);
        menu.focus();
      }
    });
    mobileNav.addEventListener('change', () => setMenu(false));
    window.addEventListener('pagehide', () => setMenu(false));
  }

  function alignHeroImage() {
    const eyebrow = document.querySelector('.hero-eyebrow');
    if (!eyebrow) return;

    const copy = eyebrow.closest('.hero-copy');
    const hero = copy.closest('.hero');
    const visual = hero.querySelector('.hero-visual');
    const align = () => {
      // Layout offsets exclude the intro animation's temporary transform.
      visual.style.setProperty('--hero-image-top', `${copy.offsetTop + eyebrow.offsetTop}px`);
    };

    align();
    const observer = new ResizeObserver(align);
    observer.observe(hero);
    observer.observe(copy);
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
    const carousel = document.querySelector('.catalog-hero, .project-carousel');
    if (!carousel) return;

    const photos = [...carousel.querySelectorAll('.catalog-slide')];
    if (photos.length < 2) return;
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
      if (!autoplay || paused || hovering || touchStart || carousel.matches(':focus-within') || document.hidden || reducedMotion.matches) return;
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
        photos[current].setAttribute('aria-hidden', 'true');
        photos[index].classList.add('is-current');
        photos[index].removeAttribute('aria-hidden');
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
      if (autoplay) {
        autoplay.hidden = reducedMotion.matches;
        autoplay.textContent = paused ? '▶' : 'Ⅱ';
        autoplay.setAttribute('aria-label', paused ? 'Play automatic property photos' : 'Pause automatic property photos');
      }
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
    autoplay?.addEventListener('click', () => {
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

  function catalogCard(template, id, project) {
    const card = template.content.firstElementChild.cloneNode(true);
    const link = card.querySelector('a');
    link.href = projectDetailUrl(id);
    link.setAttribute('aria-label', `View Project: ${project.name}`);
    card.querySelector('h3, h4').textContent = project.name;
    card.querySelector('[data-card-location]').textContent = project.location
      || (project.isDemo ? 'Location unspecified' : 'Location to be confirmed');
    card.querySelector('[data-card-type]').textContent = project.propertyType || 'Property type to be confirmed';

    const preferredImage = project.cardImage ?? project.heroImages?.[0];
    const image = !SHOW_DEMO_PROJECT_DETAILS && preferredImage?.illustrative ? undefined : preferredImage;
    const photo = card.querySelector('img');
    const note = card.querySelector('[data-card-image-note]');
    note.hidden = Boolean(!project.isDemo && image && !image.illustrative);
    note.textContent = project.isDemo ? 'Demo Project' : image ? 'Illustrative image' : 'Project image pending';
    if (image) {
      photo.src = image.src;
      photo.alt = image.alt;
    } else {
      photo.parentElement.classList.add('catalog-image-pending');
      photo.remove();
    }
    return card;
  }

  function initializeCatalog() {
    const form = document.querySelector('#catalog-filters');
    if (!form) return;

    form.querySelector('.filter-clear').addEventListener('click', () => {
      window.location.assign(form.action);
    });

    const type = selectFromUrl(form.elements.type, 'type');
    const location = selectFromUrl(form.elements.location, 'location');
    const market = location && location !== 'Across Gujarat' ? location : '';
    const categories = { Plot: 'plots', Villa: 'villas', Buy: 'residential' };
    const projects = Object.entries(propertyProjects).filter(([, project]) =>
      project.name && (SHOW_DEMO_PROJECT_DETAILS || !project.isDemo));
    const featured = document.querySelector('#featured-projects');
    const featuredTemplate = document.querySelector('#featured-card-template');
    const offerTemplate = document.querySelector('#offer-card-template');
    const highlights = type || market ? [] : projects.filter(([, project]) => project.featured);
    featured.hidden = !highlights.length;
    featured.querySelector('.property-directory').append(...highlights.map(([id, project]) => (
      catalogCard(featuredTemplate, id, project)
    )));

    let count = 0;
    document.querySelectorAll('[data-offer-type]').forEach((section) => {
      const offerType = section.dataset.offerType;
      section.hidden = Boolean(type && offerType !== type);
      if (section.hidden) return;

      const matches = projects.filter(([, project]) => project.category === categories[offerType]
        && (!market || project.location === market));
      const grid = section.querySelector('.offer-grid');
      count += matches.length;
      if (matches.length) {
        grid.append(...matches.map(([id, project]) => catalogCard(offerTemplate, id, project)));
      } else {
        const empty = document.createElement('p');
        const label = section.querySelector('.eyebrow').textContent.trim();
        empty.className = 'page-panel catalog-category-empty';
        empty.textContent = `No verified projects in ${label}${market ? ` for ${market}` : ''} are currently listed.`;
        grid.hidden = true;
        grid.after(empty);
      }

      if (location) {
        const viewAll = section.querySelector('.offer-view-all');
        const url = new URL(viewAll.href);
        url.searchParams.set('location', location);
        viewAll.href = url.href;
      }
    });

    if (type || location) {
      document.querySelector('#catalog-status').textContent =
        `${count} ${count === 1 ? 'project' : 'projects'}${location ? ` for ${location}` : ''}`;
    }
    const enquiry = document.querySelector('[data-catalog-enquiry]');
    const url = new URL(enquiry.href);
    if (type) url.searchParams.set('type', type);
    if (location) url.searchParams.set('location', location);
    enquiry.href = url.href;
  }

  function initializeMobilePropertySliders() {
    const tracks = document.querySelectorAll('.property-page :is(.property-directory, .offer-grid)');
    if (!tracks.length || !('IntersectionObserver' in window)) return;

    const config = { breakpoint: 767, interval: 3000, transitionDuration: 450 };
    const mobile = window.matchMedia(`(max-width: ${config.breakpoint}px)`);

    tracks.forEach((track, index) => {
      const slider = document.createElement('div');
      const viewport = document.createElement('div');
      const dots = document.createElement('div');
      const heading = track.closest('section').getAttribute('aria-labelledby');
      slider.className = 'property-slider';
      viewport.className = 'property-slider-viewport';
      dots.className = 'property-slider-dots';
      dots.setAttribute('role', 'group');
      dots.setAttribute('aria-label', 'Choose a property card');
      track.id ||= `property-slides-${index + 1}`;
      dots.hidden = true;
      slider.style.setProperty('--slide-duration', `${config.transitionDuration}ms`);
      track.before(slider);
      viewport.append(track);
      slider.append(viewport, dots);

      let cards = [];
      let active = 0;
      let position = 0;
      let inView = false;
      let timer;
      let transitionTimer;
      let gesture;
      let dragged = false;
      let hovered = false;

      function schedule() {
        clearTimeout(timer);
        if (!mobile.matches || cards.length < 2 || !inView || hovered
          || gesture || slider.matches(':has(:focus-visible)') || document.hidden || reducedMotion.matches) return;
        timer = setTimeout(() => move(position + 1), config.interval);
      }

      function show(positionToShow) {
        position = positionToShow;
        track.style.setProperty('--slide-position', position);
      }

      function settle() {
        clearTimeout(transitionTimer);
        track.classList.remove('is-sliding');
        track.style.removeProperty('--swipe-offset');
        // Rebase a wraparound on the matching real card before the next move.
        if (cards.length > 1) show(active + 1);
      }

      function markActive() {
        cards.forEach((card, i) => { card.inert = i !== active; });
        [...dots.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === active)));
      }

      function move(next) {
        if (cards.length < 2) return;
        clearTimeout(transitionTimer);
        active = (next + cards.length - 1) % cards.length;
        markActive();
        if (reducedMotion.matches) {
          settle();
        } else {
          track.classList.add('is-sliding');
          track.style.removeProperty('--swipe-offset');
          show(next);
          transitionTimer = setTimeout(settle, config.transitionDuration + 75);
        }
        schedule();
      }

      function copyCard(card) {
        const copy = card.cloneNode(true);
        copy.dataset.slideCopy = '';
        copy.removeAttribute('id');
        copy.querySelectorAll('[id]').forEach((child) => child.removeAttribute('id'));
        copy.inert = true;
        copy.setAttribute('aria-hidden', 'true');
        copy.classList.remove('motion-reveal');
        return copy;
      }

      function refresh() {
        const previous = cards[active];
        cards.forEach((card) => { card.inert = false; });
        track.querySelectorAll(':scope > [data-slide-copy]').forEach((copy) => copy.remove());
        cards = [...track.children].filter((card) => !card.hidden);
        active = Math.max(0, cards.indexOf(previous));
        gesture = undefined;
        dragged = false;
        track.style.removeProperty('--swipe-offset');
        track.classList.remove('is-sliding');
        clearTimeout(transitionTimer);

        const enabled = mobile.matches && cards.length > 1;
        slider.classList.toggle('is-mobile-slider', enabled);
        dots.hidden = !enabled;
        if (!enabled) {
          slider.removeAttribute('role');
          slider.removeAttribute('aria-roledescription');
          slider.removeAttribute('aria-labelledby');
          schedule();
          return;
        }

        slider.setAttribute('role', 'group');
        slider.setAttribute('aria-roledescription', 'carousel');
        if (heading) slider.setAttribute('aria-labelledby', heading);
        // Inert copies let the first and last cards slide straight into one another.
        track.prepend(copyCard(cards.at(-1)));
        track.append(copyCard(cards[0]));
        dots.replaceChildren(...cards.map((card, i) => {
          const button = document.createElement('button');
          const title = card.querySelector('h2, h3, h4')?.textContent.trim();
          button.type = 'button';
          button.setAttribute('aria-controls', track.id);
          button.setAttribute('aria-label', title ? `Show ${title}` : `Show card ${i + 1}`);
          button.addEventListener('click', () => move(i + 1));
          return button;
        }));
        show(active + 1);
        markActive();
        schedule();
      }

      track.addEventListener('transitionend', (event) => {
        if (event.target === track && event.propertyName === 'transform') settle();
      });
      dots.addEventListener('pointerdown', () => clearTimeout(timer));
      dots.addEventListener('pointerup', schedule);
      dots.addEventListener('pointercancel', schedule);
      slider.addEventListener('focusin', schedule);
      slider.addEventListener('focusout', () => queueMicrotask(schedule));
      slider.addEventListener('pointerenter', (event) => {
        if (event.pointerType !== 'mouse') return;
        hovered = true;
        schedule();
      });
      slider.addEventListener('pointerleave', (event) => {
        if (event.pointerType !== 'mouse') return;
        hovered = false;
        schedule();
      });

      viewport.addEventListener('pointerdown', (event) => {
        dragged = false;
        if (!mobile.matches || cards.length < 2 || !event.isPrimary || event.pointerType === 'mouse') return;
        gesture = { x: event.clientX, y: event.clientY };
        schedule();
      });
      viewport.addEventListener('pointermove', (event) => {
        if (!gesture || !event.isPrimary) return;
        const dx = event.clientX - gesture.x;
        const dy = event.clientY - gesture.y;
        if (!dragged && (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy))) return;
        if (!dragged) settle();
        dragged = true;
        if (!reducedMotion.matches) {
          const limit = track.clientWidth;
          track.style.setProperty('--swipe-offset', `${Math.max(-limit, Math.min(dx, limit))}px`);
        }
      });
      function finishGesture(event) {
        if (!gesture || !event.isPrimary) return;
        const dx = event.clientX - gesture.x;
        gesture = undefined;
        if (dragged) {
          const step = event.type === 'pointerup' && Math.abs(dx) >= 42 ? Math.sign(-dx) : 0;
          move(position + step);
        } else schedule();
      }
      viewport.addEventListener('pointerup', finishGesture);
      viewport.addEventListener('pointercancel', finishGesture);
      viewport.addEventListener('click', (event) => {
        if (!dragged || event.detail === 0) return;
        dragged = false;
        event.preventDefault();
        event.stopPropagation();
      }, true);

      const observer = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio >= .4;
        schedule();
      }, { threshold: .4 });
      observer.observe(viewport);
      new MutationObserver((changes) => {
        if (changes.some(({ target, type, addedNodes, removedNodes }) => {
          if (type === 'attributes') return target.parentElement === track && !target.hasAttribute('data-slide-copy');
          return target === track && [...addedNodes, ...removedNodes].some((node) =>
            node instanceof Element && !node.hasAttribute('data-slide-copy'));
        })) refresh();
      }).observe(track, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
      mobile.addEventListener('change', refresh);
      reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches && slider.classList.contains('is-mobile-slider')) settle();
        schedule();
      });
      document.addEventListener('visibilitychange', schedule);
      refresh();
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
    if (!form || form.parentElement.closest('[hidden]')) return;

    const projectName = form.dataset.projectName;
    if (!projectName) {
      selectFromUrl(form.elements.type, 'type');
      selectFromUrl(form.elements.location, 'location');
    }
    const project = params.get('project');
    if (project && Object.values(propertyProjects).some((record) =>
      !record.isDemo && (record.name || record.developer) === project)) {
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
      const body = [
        `Name: ${fields.name.value.trim()}`,
        `Phone: ${formattedPhone}`,
        `Email: ${fields.email.value.trim()}`,
      ];
      if (projectName) {
        body.unshift(`Project: ${projectName}`);
        if ('demoProject' in form.dataset) body.push('Context: Illustrative project preview');
        if (fields.requirement.value) body.push(`Requirement: ${fields.requirement.value}`);
      } else {
        body.push(
          `Property type: ${fields.type.selectedOptions[0].textContent.trim()}`,
          `Preferred location: ${fields.location.selectedOptions[0].textContent.trim()}`,
        );
      }
      const requirements = fields.requirements.value.trim();
      if (requirements) body.push('', requirements);
      const draftBody = body.join('\r\n');
      const subject = encodeURIComponent(projectName ? `Project enquiry: ${projectName}` : 'Property enquiry for Fractobite Realty');
      document.querySelector('#enquiry-email').href = `mailto:${contact.email}?subject=${subject}&body=${encodeURIComponent(draftBody)}`;
      draft.value = draftBody;
      result.hidden = false;
      status.textContent = 'Your draft is ready. Open your email app or copy the draft.';
      draft.focus();
    });

    form.hidden = false;
  }

  function initializeDropdowns() {
    if (typeof HTMLElement.prototype.showPopover !== 'function') return;
    const fields = [...document.querySelectorAll('.dropdown > select')];
    if (!fields.length) return;

    const list = document.createElement('div');
    list.className = 'dropdown-menu';
    list.id = 'dropdown-options';
    list.popover = 'manual';
    list.setAttribute('role', 'listbox');
    document.body.append(list);

    const dropdowns = [];
    let openField;
    let activeIndex = -1;
    let typed = '';
    let lastTyped = 0;

    function sync(field) {
      field.trigger.textContent = field.select.selectedOptions[0]?.textContent || '';
      if (field.select.validity.valid) field.trigger.removeAttribute('aria-invalid');
    }

    function close() {
      if (!openField) return;
      list.hidePopover();
      openField.wrapper.removeAttribute('data-open');
      openField.trigger.setAttribute('aria-expanded', 'false');
      openField.trigger.removeAttribute('aria-activedescendant');
      openField = undefined;
    }

    function positionList() {
      if (!openField) return;
      const rect = openField.trigger.getBoundingClientRect();
      const viewport = window.visualViewport;
      const left = viewport?.offsetLeft ?? 0;
      const top = viewport?.offsetTop ?? 0;
      const right = left + (viewport?.width ?? document.documentElement.clientWidth);
      const bottom = top + (viewport?.height ?? document.documentElement.clientHeight);
      if (rect.bottom <= top || rect.top >= bottom) {
        close();
        return;
      }

      const gap = 5;
      const inset = 8;
      const width = Math.min(rect.width, right - left - inset * 2);
      const preferred = Math.min(282, list.children.length * 44 + 12);
      const below = bottom - rect.bottom - gap - inset;
      const above = rect.top - top - gap - inset;
      const flip = below < preferred && above > below;
      list.style.width = `${width}px`;
      list.style.left = `${Math.max(left + inset, Math.min(rect.left, right - inset - width))}px`;
      list.style.maxHeight = `${Math.max(0, Math.min(preferred, flip ? above : below))}px`;
      list.style.top = `${flip ? rect.top - gap - list.offsetHeight : rect.bottom + gap}px`;
    }

    function activate(index) {
      if (index < 0 || index >= list.children.length) return;
      const option = list.children[index];
      list.children[activeIndex]?.classList.remove('is-active');
      activeIndex = index;
      option.classList.add('is-active');
      openField.trigger.setAttribute('aria-activedescendant', option.id);
      const rect = option.getBoundingClientRect();
      const menuRect = list.getBoundingClientRect();
      if (rect.top < menuRect.top) list.scrollTop -= menuRect.top - rect.top;
      else if (rect.bottom > menuRect.bottom) list.scrollTop += rect.bottom - menuRect.bottom;
    }

    function open(field) {
      if (field.select.disabled) return;
      close();
      sync(field);
      openField = field;
      activeIndex = -1;
      typed = '';
      list.setAttribute('aria-label', field.trigger.getAttribute('aria-label'));
      list.replaceChildren(...[...field.select.options].map((option, index) => {
        const item = document.createElement('div');
        item.className = 'dropdown-option';
        item.id = `dropdown-option-${index}`;
        item.dataset.index = index;
        item.textContent = option.textContent;
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', String(option.selected));
        if (option.disabled) item.setAttribute('aria-disabled', 'true');
        return item;
      }));
      field.wrapper.setAttribute('data-open', '');
      field.trigger.setAttribute('aria-expanded', 'true');
      list.showPopover();
      positionList();
      if (openField) activate(field.select.selectedIndex);
    }

    function selectOption(index) {
      if (!openField) return;
      const field = openField;
      const { select, trigger } = field;
      const option = select.options[index];
      if (!option || option.disabled) return;
      const changed = select.selectedIndex !== index;
      select.selectedIndex = index;
      sync(field);
      close();
      trigger.focus({ preventScroll: true });
      if (changed) {
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    function onKeyDown(event, field) {
      const { key } = event;
      if (key === 'Tab') {
        if (openField === field) {
          selectOption(activeIndex);
          close();
        }
        return;
      }
      if (key === 'Escape' && openField === field) {
        event.preventDefault();
        event.stopPropagation();
        close();
        return;
      }
      if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        if (openField === field) selectOption(activeIndex);
        else open(field);
        return;
      }

      const navigation = ['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(key);
      const character = key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
      if (!navigation && !character) return;
      event.preventDefault();
      const wasOpen = openField === field;
      if (!wasOpen) open(field);
      if (openField !== field) return;

      const available = [...field.select.options].flatMap((option, index) => option.disabled ? [] : [index]);
      if (key === 'Home') activate(available[0]);
      else if (key === 'End') activate(available.at(-1));
      else if (navigation && wasOpen) {
        const step = key === 'ArrowDown' ? 1 : -1;
        const position = available.indexOf(activeIndex);
        activate(available[Math.min(available.length - 1, Math.max(0, position + step))]);
      } else if (character) {
        const now = performance.now();
        const letter = key.toLowerCase();
        typed = now - lastTyped > 600 || typed === letter ? letter : typed + letter;
        lastTyped = now;
        const start = available.indexOf(activeIndex);
        const ordered = [...available.slice(start + 1), ...available.slice(0, start + 1)];
        const match = ordered.find((index) => field.select.options[index].textContent.trim().toLowerCase().startsWith(typed));
        if (match !== undefined) activate(match);
      }
    }

    fields.forEach((select) => {
      if (select.multiple || select.size > 1 || select.disabled) return;
      const trigger = document.createElement('span');
      trigger.className = 'dropdown-control';
      trigger.tabIndex = 0;
      trigger.setAttribute('role', 'combobox');
      trigger.setAttribute('aria-label', select.getAttribute('aria-label'));
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', list.id);
      if (select.required) trigger.setAttribute('aria-required', 'true');
      const field = { select, trigger, wrapper: select.parentElement };

      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        trigger.focus({ preventScroll: true });
        if (openField === field) close();
        else open(field);
      });
      trigger.addEventListener('keydown', (event) => onKeyDown(event, field));
      select.addEventListener('change', () => sync(field));
      select.addEventListener('invalid', (event) => {
        event.preventDefault();
        trigger.setAttribute('aria-invalid', 'true');
        trigger.focus();
        open(field);
      });
      select.labels[0]?.addEventListener('click', (event) => {
        if (field.wrapper.contains(event.target)) return;
        event.preventDefault();
        trigger.focus();
      });
      select.after(trigger);
      select.hidden = true;
      sync(field);
      dropdowns.push(field);
    });

    list.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.target.closest('.dropdown-option')) event.preventDefault();
    });
    list.addEventListener('click', (event) => {
      const option = event.target.closest('.dropdown-option');
      if (option) selectOption(Number(option.dataset.index));
    });
    document.addEventListener('pointerdown', (event) => {
      if (openField && !list.contains(event.target) && !openField.wrapper.contains(event.target)) close();
    });
    document.addEventListener('focusin', (event) => {
      if (openField && event.target !== openField.trigger && !list.contains(event.target)) close();
    });
    document.addEventListener('scroll', (event) => {
      if (!list.contains(event.target)) positionList();
    }, true);
    window.addEventListener('resize', positionList);
    window.visualViewport?.addEventListener('resize', positionList);
    window.visualViewport?.addEventListener('scroll', positionList);
    window.addEventListener('pageshow', () => dropdowns.forEach(sync));
    window.addEventListener('pagehide', close);
    document.addEventListener('reset', () => requestAnimationFrame(() => dropdowns.forEach(sync)));
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
      '.project-carousel', '.project-overview-photo', '.project-icon-grid > li',
      '.project-spec-grid > div', '#project-gallery-track', '.project-map', '.project-connectivity',
      '.property-slider.is-mobile-slider',
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
  alignHeroImage();
  initializeHeroSlider();
  initializeCatalogCarousel();
  initializePropertySearch();
  initializeCategoryCarousel();
  initializeCatalog();
  initializeMobilePropertySliders();
  initializeLocations();
  initializeInsights();
  initializeEnquiry();
  initializeDemoLinks();
  initializeDropdowns();
  initializeContentMotion();
})();
