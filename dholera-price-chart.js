(() => {
  'use strict';

  const chart = document.querySelector('#dholera-price-plot');
  const baseline = 183;
  const span = 139;
  const spacing = 71;
  const halfBar = 30;
  const maxPrice = Math.max(...dholeraPriceDemo.map(({ value }) => value));
  const points = dholeraPriceDemo.map((record, index) => ({
    ...record,
    x: 42 + index * spacing,
    y: baseline - record.value / maxPrice * span,
  }));

  function svgElement(name, attributes, text) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // Limit every tangent to its adjoining slopes, so the curve reaches each
  // marker smoothly without overshooting the values between markers.
  const slopes = points.slice(1).map(({ y }, index) => points[index].y - y);
  const tangent = (index) => Math.min(slopes[index - 1] ?? slopes[0], slopes[index] ?? slopes.at(-1));
  const [first] = points;
  const last = points.at(-1);
  const segments = points.slice(1).map(({ x, y }, index) => {
    const previous = points[index];
    return `C ${previous.x + spacing / 3} ${previous.y - tangent(index) / 3} ${x - spacing / 3} ${y + tangent(index + 1) / 3} ${x} ${y}`;
  });
  const arrow = svgElement('marker', {
    id: 'dholera-trend-arrow', markerWidth: 7, markerHeight: 7, refX: 6, refY: 3.5, orient: 'auto',
  });
  arrow.append(svgElement('path', { d: 'M 0 0 L 7 3.5 L 0 7 Z' }));
  const defs = svgElement('defs', {});
  defs.append(arrow);

  const rupees = new Intl.NumberFormat('en-IN');
  chart.append(
    svgElement('title', { id: 'dholera-plot-title' }, 'Illustrative land price scenario'),
    svgElement('desc', { id: 'dholera-plot-description' },
      `Sample rupees per square yard: ${points.map(({ year, value, era }) => `${year}: ₹${rupees.format(value)} (${era} era)`).join('; ')}.`),
    defs,
    svgElement('path', { class: 'dholera-baseline', d: `M 3 ${baseline} H 741` }),
  );

  for (const { x, y, era } of points) {
    const radius = Math.min(11, baseline - y);
    chart.append(svgElement('path', {
      class: `dholera-bar dholera-bar--${era}`,
      d: `M ${x - halfBar} ${baseline} V ${y + radius} Q ${x - halfBar} ${y} ${x - halfBar + radius} ${y} H ${x + halfBar - radius} Q ${x + halfBar} ${y} ${x + halfBar} ${y + radius} V ${baseline} Z`,
    }));
  }

  chart.append(svgElement('path', {
    class: 'dholera-trend',
    d: `M ${first.x} ${first.y} ${segments.join(' ')} L ${last.x + 39} ${last.y - tangent(points.length - 1) * 39 / spacing}`,
    'marker-end': 'url(#dholera-trend-arrow)',
  }));

  for (const { x, y, year, value, era } of points) {
    const label = value < 1000 ? value : `${value / 1000}k`;
    chart.append(
      svgElement('circle', { class: 'dholera-trend-marker', cx: x, cy: y, r: 4.5 }),
      svgElement('text', { class: `dholera-value dholera-value--${era}`, x, y: y - 13 }, `₹${label}`),
      svgElement('text', { class: 'dholera-year', x, y: baseline + 21 }, year),
    );
  }
})();
