(() => {
  'use strict';

  const chart = document.querySelector('#dholera-price-plot');
  const tooltip = document.querySelector('#dholera-chart-tooltip');
  const baseline = 141;
  const points = dholeraPriceDemo.map((record) => ({
    ...record,
    x: 32 + (record.year - 2006) / 19 * 684,
    y: baseline - record.value / 14000 * 120,
  }));

  function svgElement(name, attributes, text) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    if (text !== undefined) node.textContent = text;
    return node;
  }

  const [first] = points;
  const last = points.at(-1);
  const path = `M ${points.map(({ x, y }) => `${x} ${y}`).join(' L ')}`;
  const defs = svgElement('defs', {});
  const gradient = svgElement('linearGradient', { id: 'dholera-area-gradient', x1: '0', y1: '0', x2: '0', y2: '1' });
  gradient.append(
    svgElement('stop', { offset: '0%', 'stop-color': 'var(--brand-orange)', 'stop-opacity': '.2' }),
    svgElement('stop', { offset: '100%', 'stop-color': 'var(--brand-orange)', 'stop-opacity': '0' }),
  );
  defs.append(gradient);

  const rupees = new Intl.NumberFormat('en-IN');
  chart.append(
    svgElement('title', { id: 'dholera-plot-title' }, 'Illustrative land price scenario'),
    svgElement('desc', { id: 'dholera-plot-description' },
      `Illustrative rupees per square yard: ${points.map(({ year, value }) => `${year}: ₹${rupees.format(value)}`).join('; ')}.`),
    defs,
    svgElement('path', { class: 'dholera-area', d: `${path} L ${last.x} ${baseline} L ${first.x} ${baseline} Z` }),
    svgElement('path', { class: 'dholera-trend', d: path }),
  );

  function showTooltip(point) {
    tooltip.textContent = `Year: ${point.year} · Illustrative Price: ₹${rupees.format(point.value)} / sq. yard`;
    tooltip.hidden = false;
    const width = chart.getBoundingClientRect().width;
    const x = point.x / 748 * width;
    tooltip.style.left = `${Math.max(tooltip.offsetWidth / 2 + 4, Math.min(width - tooltip.offsetWidth / 2 - 4, x))}px`;
    tooltip.style.top = `${Math.max(0, point.y / 176 * chart.getBoundingClientRect().height - tooltip.offsetHeight - 8)}px`;
  }
  for (const point of points) {
    const marker = svgElement('circle', { class: 'dholera-trend-marker', cx: point.x, cy: point.y, r: 5, tabindex: 0, role: 'button', 'aria-label': `${point.year}: illustrative price ₹${rupees.format(point.value)} per square yard` });
    marker.addEventListener('mouseenter', () => showTooltip(point));
    marker.addEventListener('focus', () => showTooltip(point));
    marker.addEventListener('click', () => showTooltip(point));
    marker.addEventListener('mouseleave', () => { tooltip.hidden = true; });
    marker.addEventListener('blur', () => { tooltip.hidden = true; });
    marker.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showTooltip(point); } });
    chart.append(marker);
  }
  for (const year of [2006, 2011, 2015, 2020, 2025]) {
    const point = points.find((record) => record.year === year);
    chart.append(svgElement('text', { class: 'dholera-year', x: point.x, y: 168 }, year));
  }
  chart.append(
    svgElement('text', { class: 'dholera-value', x: first.x + 6, y: first.y - 12, 'text-anchor': 'start' }, '₹300'),
    svgElement('text', { class: 'dholera-value', x: last.x - 6, y: last.y - 12, 'text-anchor': 'end' }, '₹13k'),
  );
})();
