(() => {
  'use strict';

  const pending = 'To be confirmed';
  const pendingLocation = 'Location to be confirmed';
  const selectedId = new URLSearchParams(window.location.search).get('project');
  const project = Object.hasOwn(propertyProjects, selectedId) ? propertyProjects[selectedId] : undefined;
  if (!project) return;
  if (!project.name) {
    document.title = `${project.developer} | Fractobite Realty`;
    const notice = document.querySelector('#project-unavailable');
    notice.querySelector('h1').textContent = `${project.developer} project details pending`;
    notice.querySelector('p').textContent = project.description;
    return;
  }

  const find = (selector) => document.querySelector(selector);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function element(tag, className = '', text = '') {
    const item = document.createElement(tag);
    if (className) item.className = className;
    item.textContent = text;
    return item;
  }

  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const use = document.createElementNS(svg.namespaceURI, 'use');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    use.setAttribute('href', `#icon-${name}`);
    svg.append(use);
    return svg;
  }

  function setImage(img, image) {
    if (!image) return;
    img.alt = image.alt;
    img.src = image.src;
  }

  function appendIconItems(container, items) {
    items.forEach(([glyph, label]) => {
      const item = element('li');
      item.append(icon(glyph), element('strong', '', label));
      container.append(item);
    });
  }

  function renderImageSet() {
    const carousel = find('.project-carousel');
    const images = carousel.querySelector('.catalog-hero-images');
    const dots = carousel.querySelector('.catalog-dots');
    const heroImages = project.heroImages ?? [];
    heroImages.forEach((image, index) => {
      const img = element('img', 'catalog-slide');
      img.alt = image.alt;
      if (!index) {
        img.fetchPriority = 'high';
        img.classList.add('is-current');
        img.src = image.src;
      } else {
        img.dataset.src = image.src;
        img.setAttribute('aria-hidden', 'true');
      }
      images.append(img);

      const dot = element('button');
      dot.type = 'button';
      dot.dataset.slide = index;
      dot.setAttribute('aria-label', `Show project photo ${index + 1}`);
      dot.setAttribute('aria-pressed', String(index === 0));
      dots.append(dot);
    });
    const caption = find('#project-hero-caption');
    caption.textContent = heroImages.length ? 'Illustrative imagery' : 'Project photos coming soon';
    caption.hidden = heroImages.length > 0 && !heroImages.some((image) => image.illustrative);

    const overview = find('#project-overview-image');
    setImage(overview, project.overviewImage);
    const overviewCaption = find('#project-overview-caption');
    overviewCaption.textContent = 'Illustrative image';
    overviewCaption.hidden = !project.overviewImage?.illustrative;
    overview.parentElement.hidden = !project.overviewImage;

    const gallery = project.gallery ?? [];
    const galleryNote = find('#project-gallery-note');
    galleryNote.textContent = gallery.some((image) => image.illustrative)
      ? 'Illustrative images. Verified project photos are pending.'
      : '';
    if (!gallery.length) {
      galleryNote.textContent = 'Project photos are to be confirmed.';
      find('.project-gallery-layout').hidden = true;
      find('.project-gallery-dots').hidden = true;
    }
    const track = find('#project-gallery-track');
    gallery.forEach((image) => {
      const img = element('img');
      img.loading = 'lazy';
      img.width = 640;
      img.height = 300;
      setImage(img, image);
      track.append(img);
    });
  }

  function renderSpecifications() {
    const overviewItems = project.highlights ?? project.illustrativeHighlights ?? [];
    const amenities = project.amenities ?? project.illustrativeAmenities ?? [];
    appendIconItems(find('#project-highlights'), overviewItems);
    appendIconItems(find('#project-amenities'), amenities);
    find('#project-highlights-note').textContent = project.illustrativeHighlights && !project.highlights
      ? 'Illustrative features. Project details are pending verification.'
      : overviewItems.length ? '' : 'Project features are to be confirmed.';
    find('#project-amenities-note').textContent = project.illustrativeAmenities && !project.amenities
      ? 'Reference examples. Amenities are to be confirmed.'
      : amenities.length ? '' : 'Amenities for this project are to be confirmed.';

    const specs = [
      ['layers', 'Property Type', project.propertyType],
      ['size', 'Plot Sizes', project.specifications?.sizes],
      ['building', 'Project Status', project.specifications?.status],
      ['calendar', 'Possession', project.specifications?.possession],
    ];
    specs.forEach(([glyph, label, value]) => {
      const item = element('div');
      const term = element('dt');
      term.append(icon(glyph), element('span', '', label));
      item.append(term, element('dd', '', value || pending));
      find('#project-specifications').append(item);
    });
  }

  function renderConnectivity() {
    const map = project.map;
    if (map?.verified && Number.isFinite(map.latitude) && Number.isFinite(map.longitude)
      && Math.abs(map.latitude) <= 90 && Math.abs(map.longitude) <= 180) {
      const { latitude, longitude } = map;
      const query = new URLSearchParams({
        bbox: [longitude - .01, latitude - .01, longitude + .01, latitude + .01].join(','),
        marker: `${latitude},${longitude}`,
        layer: 'mapnik',
      });
      const frame = element('iframe');
      frame.src = `https://www.openstreetmap.org/export/embed.html?${query}`;
      frame.title = `Map for ${project.name}`;
      frame.loading = 'lazy';
      find('#project-map').replaceChildren(frame);
    }
    if (!project.connectivity?.length) return;
    const items = find('#project-connectivity-items');
    project.connectivity.forEach(({ label, detail, glyph = 'pin' }) => {
      const entry = element('li');
      entry.append(icon(glyph), element('span', '', `${label} – ${detail}`));
      items.append(entry);
    });
    find('#project-connectivity-note').hidden = true;
  }

  function renderRelated() {
    const grid = find('#project-related');
    const related = (project.relatedProjectIds ?? []).filter((id) => id !== selectedId && propertyProjects[id]?.name);
    if (!related.length) grid.parentElement.hidden = true;
    related.slice(0, 3).forEach((id) => {
      const other = propertyProjects[id];
      const card = element('article', 'project-related-card');
      const img = element('img');
      img.loading = 'lazy';
      img.width = 480;
      img.height = 200;
      const image = other.heroImages?.[0];
      if (image) {
        const figure = element('figure');
        setImage(img, image);
        figure.append(img);
        if (image.illustrative) figure.append(element('figcaption', 'project-image-caption', 'Illustrative image'));
        card.append(figure);
      }
      const body = element('div');
      const location = element('p', 'project-pin');
      location.append(icon('pin'), element('span', '', other.location || pendingLocation));
      const link = element('a', 'text-link', 'View Project ');
      link.href = projectDetailUrl(id);
      link.setAttribute('aria-label', `View Project: ${other.name}`);
      link.append(icon('arrow'));
      body.append(element('h3', '', other.name), location, link);
      card.append(body);
      grid.append(card);
    });
  }

  function initializeGallery() {
    const track = find('#project-gallery-track');
    if (!track.firstElementChild) return;
    const prev = find('.project-gallery-prev');
    const next = find('.project-gallery-next');
    const dots = find('.project-gallery-dots');
    let stops = [0];

    function currentStop() {
      return stops.reduce((best, stop, index) => (
        Math.abs(stop - track.scrollLeft) < Math.abs(stops[best] - track.scrollLeft) ? index : best
      ), 0);
    }

    function navigate(index) {
      const target = Math.min(stops.length - 1, Math.max(0, index));
      track.scrollTo({ left: stops[target], behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }

    function sync() {
      const current = currentStop();
      prev.disabled = current === 0;
      next.disabled = current === stops.length - 1;
      [...dots.children].forEach((dot, index) => dot.setAttribute('aria-pressed', String(index === current)));
    }

    function measure() {
      const max = Math.max(0, track.scrollWidth - track.clientWidth);
      const first = track.firstElementChild.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(track).columnGap);
      const step = first.width + gap;
      stops = [0];
      for (let position = step; position > 0 && position < max - 2; position += step) stops.push(position);
      if (max > 2) stops.push(max);
      if (dots.children.length !== stops.length) {
        dots.replaceChildren(...stops.map((_, index) => {
          const dot = element('button');
          dot.type = 'button';
          dot.setAttribute('aria-label', `Show gallery position ${index + 1}`);
          dot.addEventListener('click', () => navigate(index));
          return dot;
        }));
      }
      dots.hidden = stops.length === 1;
      sync();
    }

    prev.addEventListener('click', () => navigate(currentStop() - 1));
    next.addEventListener('click', () => navigate(currentStop() + 1));
    track.addEventListener('scroll', sync, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(track);
    else window.addEventListener('resize', measure);
    measure();
  }

  const name = project.name;
  const copy = {
    ...project,
    label: project.isDemo ? 'Demo Project' : 'Featured Project',
    location: project.location || (project.isDemo ? 'Location unspecified' : pendingLocation),
  };
  document.title = `${name} | Fractobite Realty`;
  document.querySelectorAll('[data-project-text]').forEach((node) => {
    node.textContent = copy[node.dataset.projectText] || pending;
  });
  renderImageSet();
  find('#project-unavailable').hidden = true;
  find('.project-detail').hidden = false;
  if (project.isDemo) {
    document.querySelectorAll('[data-hide-for-demo]').forEach((section) => { section.hidden = true; });
    return;
  }

  find('#enquiry-form').dataset.projectName = name;
  renderSpecifications();
  renderConnectivity();
  renderRelated();
  initializeGallery();

  find('.project-hero-enquire').addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const hash = event.currentTarget.hash;
    if (window.location.hash !== hash) history.pushState(null, '', hash);
    find('#project-enquiry').scrollIntoView({ block: 'start' });
    find('#enquiry-form input').focus({ preventScroll: true });
  });
})();
