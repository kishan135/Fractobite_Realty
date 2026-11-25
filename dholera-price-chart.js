(() => {
  'use strict';

  const chart = document.querySelector('#dholera-price-plot');
  if (!chart || !Array.isArray(dholeraPriceDemo)) return;

  const plot = { left: 82, right: 750, top: 28, bottom: 248, max: 15000 };
  const yFor = (value) => plot.bottom - value / plot.max * (plot.bottom - plot.top);
  const xFor = (index) => plot.left + 30 + index * ((plot.right - plot.left - 60) / (dholeraPriceDemo.length - 1));
  const format = (value) => `₹${value < 1000 ? value : `${value / 1000}k`}`;

  function svg(name, attributes = {}, label) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    if (label !== undefined) node.textContent = label;
    return node;
  }

  const points = dholeraPriceDemo.map((record, index) => ({
    ...record, x: xFor(index), y: yFor(record.value),
  }));
  const rupees = new Intl.NumberFormat('en-IN');
  chart.append(
    svg('title', { id: 'dholera-plot-title' }, 'Illustrative Dholera land price scenario in rupees per square yard'),
    svg('desc', { id: 'dholera-plot-description' },
      `The bars and line show the same illustrative values, from ₹300 in 2006 to ₹13,000 in 2025. ${points.map(({ year, value }) => `${year}: ₹${rupees.format(value)}`).join('; ')}. These are not verified historical prices.`),
  );

  for (const value of [0, 5000, 10000, 15000]) {
    const y = yFor(value);
    chart.append(
      svg('line', { class: 'dholera-grid-line', x1: plot.left, x2: plot.right, y1: y, y2: y }),
      svg('text', { class: 'dholera-axis-label', x: plot.left - 11, y: y + 4, 'text-anchor': 'end' }, format(value)),
    );
  }
  chart.append(svg('text', { class: 'dholera-axis-unit', x: plot.left, y: 15 }, '₹ / sq. yd.'));

  points.forEach(({ x, y, year, value, era }) => {
    const item = svg('g', { class: 'dholera-data-point', tabindex: '0', 'aria-label': `${year}: ₹${rupees.format(value)} per square yard, illustrative ${era} era value` });
    item.append(
      svg('title', {}, `${year} · ₹${rupees.format(value)} per sq. yard · Illustrative value`),
      svg('rect', { class: `dholera-bar dholera-bar--${era}`, x: x - 15, y, width: 30, height: plot.bottom - y, rx: 4 }),
      svg('text', { class: `dholera-value dholera-value--${era}`, x, y: y - 13 }, format(value)),
      svg('text', { class: 'dholera-year', x, y: plot.bottom + 25 }, year),
    );
    chart.append(item);
  });

  chart.append(svg('polyline', {
    class: 'dholera-trend',
    points: points.map(({ x, y }) => `${x},${y}`).join(' '),
    'aria-hidden': 'true',
  }));
  points.forEach(({ x, y }) => chart.append(svg('circle', {
    class: 'dholera-trend-marker', cx: x, cy: y, r: 4.5, 'aria-hidden': 'true',
  })));
})();
