(() => {
  'use strict';

  const chart = document.querySelector('#dholera-price-plot');
  const tooltip = document.querySelector('#dholera-chart-tooltip');
  const plotHeight = 400;
  const baseline = 365;
  const points = dholeraPriceDemo.map((record, index) => ({
    ...record,
    x: 42 + index * 73,
    y: baseline - record.value / 13000 * 285,
  }));

  function svgElement(name, attributes, text) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    if (text !== undefined) node.textContent = text;
    return node;
  }

  const path = `M ${points.map(({ x, y }) => `${x} ${y}`).join(' L ')}`;
  const rupees = new Intl.NumberFormat('en-IN');
  chart.append(
    svgElement('title', { id: 'dholera-plot-title' }, 'Illustrative land price scenario'),
    svgElement('desc', { id: 'dholera-plot-description' },
      `Illustrative rupees per square yard: ${points.map(({ year, value }) => `${year}: ₹${rupees.format(value)}`).join('; ')}.`),
  );
  chart.append(svgElement('line', { class: 'dholera-chart-baseline', x1: 6, x2: 742, y1: baseline, y2: baseline }));
  for (const point of points) {
    const halfWidth = 13;
    const top = Math.min(point.y + 7, baseline - 4);
    const radius = Math.min(6, (baseline - top) / 2);
    chart.append(svgElement('path', {
      class: `dholera-bar dholera-bar--${point.era}`,
      d: `M ${point.x - halfWidth} ${baseline} V ${top + radius} Q ${point.x - halfWidth} ${top} ${point.x - halfWidth + radius} ${top} H ${point.x + halfWidth - radius} Q ${point.x + halfWidth} ${top} ${point.x + halfWidth} ${top + radius} V ${baseline} Z`,
    }));
  }
  chart.append(svgElement('path', { class: 'dholera-trend', d: path }));

  function showTooltip(point) {
    tooltip.textContent = `Year: ${point.year} · Illustrative Price: ₹${rupees.format(point.value)} / sq. yard`;
    tooltip.hidden = false;
    const width = chart.getBoundingClientRect().width;
    const x = point.x / 748 * width;
    tooltip.style.left = `${Math.max(tooltip.offsetWidth / 2 + 4, Math.min(width - tooltip.offsetWidth / 2 - 4, x))}px`;
    tooltip.style.top = `${Math.max(0, point.y / plotHeight * chart.getBoundingClientRect().height - tooltip.offsetHeight - 8)}px`;
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
  for (const point of points) {
    const compact = point.value < 1000 ? point.value : `${point.value / 1000}k`;
    chart.append(
      svgElement('text', { class: 'dholera-year', x: point.x, y: 389 }, point.year),
      svgElement('text', { class: `dholera-value dholera-value--${point.era}`, x: point.x, y: point.y - 13 }, `₹${compact}`),
    );
  }
})();
