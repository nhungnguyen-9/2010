(function (app) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const LEAF_GREEN = '#7BB07A';
  const LEAF_DEEP = '#4E8A5B';
  let gradientCounter = 0;

  function svgEl(tag, attrs) {
    const element = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach((key) => element.setAttribute(key, String(attrs[key])));
    }
    return element;
  }

  function petalPath(shape, length, width) {
    const l = length;
    const w = width;
    switch (shape) {
      case 'pointed':
        return `M0 0 C${-w} ${-l * 0.3} ${-w * 0.55} ${-l * 0.75} 0 ${-l} C${w * 0.55} ${-l * 0.75} ${w} ${-l * 0.3} 0 0Z`;
      case 'notched':
        return `M0 0 C${-w} ${-l * 0.3} ${-w * 1.05} ${-l * 0.85} ${-w * 0.4} ${-l} L0 ${-l * 0.84} L${w * 0.4} ${-l} C${w * 1.05} ${-l * 0.85} ${w} ${-l * 0.3} 0 0Z`;
      case 'thin':
        return `M0 0 C${-w} ${-l * 0.15} ${-w} ${-l * 0.95} 0 ${-l} C${w} ${-l * 0.95} ${w} ${-l * 0.15} 0 0Z`;
      default:
        return `M0 0 C${-w} ${-l * 0.2} ${-w * 1.05} ${-l * 0.9} 0 ${-l} C${w * 1.05} ${-l * 0.9} ${w} ${-l * 0.2} 0 0Z`;
    }
  }

  function createPetalGradient(defs, palette) {
    gradientCounter += 1;
    const id = `mx-petal-${gradientCounter}`;
    const gradient = svgEl('radialGradient', { id, cx: '50%', cy: '100%', r: '110%' });
    gradient.append(
      svgEl('stop', { offset: '0%', 'stop-color': palette.petalDeep }),
      svgEl('stop', { offset: '75%', 'stop-color': palette.petal })
    );
    defs.append(gradient);
    return `url(#${id})`;
  }

  function createPetalRenderer(group) {
    let petalIndex = 0;
    return function addPetal(parent, shape, length, width, fill, rotation, extraAttrs) {
      const holder = svgEl('g', { transform: `rotate(${rotation})` });
      const petal = svgEl('path', Object.assign({
        d: petalPath(shape, length, width),
        fill,
        class: 'petal',
        style: `--i:${petalIndex}`
      }, extraAttrs || {}));
      petalIndex += 1;
      holder.append(petal);
      (parent || group).append(holder);
      return petal;
    };
  }

  function radial(addPetal, parent, options) {
    const { count, shape, length, width, fill, offset = 0, attrs } = options;
    for (let index = 0; index < count; index += 1) {
      addPetal(parent, shape, length, width, fill, offset + (index * 360) / count, attrs);
    }
  }

  function addStamens(group, count, radius, color, tipColor) {
    for (let index = 0; index < count; index += 1) {
      const angle = ((index * 360) / count + 8) * (Math.PI / 180);
      const x = Math.sin(angle) * radius;
      const y = -Math.cos(angle) * radius;
      group.append(
        svgEl('line', { x1: 0, y1: 0, x2: x.toFixed(2), y2: y.toFixed(2), stroke: color, 'stroke-width': 1.1, 'stroke-linecap': 'round', class: 'stamen' }),
        svgEl('circle', { cx: x.toFixed(2), cy: y.toFixed(2), r: 1.8, fill: tipColor, class: 'stamen' })
      );
    }
  }

  function leaf(x, y, length, rotation, className) {
    const holder = svgEl('g', { transform: `translate(${x} ${y}) rotate(${rotation})` });
    holder.append(svgEl('path', {
      d: `M0 0 C${length * 0.3} ${-length * 0.35} ${length * 0.75} ${-length * 0.3} ${length} 0 C${length * 0.7} ${length * 0.28} ${length * 0.3} ${length * 0.25} 0 0Z`,
      fill: LEAF_GREEN,
      stroke: LEAF_DEEP,
      'stroke-width': 0.6,
      class: className || 'leaf'
    }));
    return holder;
  }

  const builders = {
    daisy(group, palette, addPetal, fill) {
      radial(addPetal, group, { count: 22, shape: 'thin', length: 40, width: 5, fill, attrs: { stroke: '#E6EAF2', 'stroke-width': 0.6 } });
      group.append(
        svgEl('circle', { r: 10, fill: palette.center, class: 'flower-center' }),
        svgEl('circle', { r: 10, fill: 'none', stroke: '#D9A21E', 'stroke-width': 1.4, 'stroke-dasharray': '1.5 2', class: 'flower-center' })
      );
    },
    sunflower(group, palette, addPetal) {
      radial(addPetal, group, { count: 18, shape: 'pointed', length: 44, width: 10, fill: palette.petalDeep });
      radial(addPetal, group, { count: 18, shape: 'pointed', length: 38, width: 9, fill: palette.petal, offset: 10 });
      group.append(svgEl('circle', { r: 17, fill: palette.center, class: 'flower-center' }));
      for (let index = 0; index < 34; index += 1) {
        const radius = 2.6 * Math.sqrt(index + 0.5);
        const angle = index * 2.39996;
        group.append(svgEl('circle', {
          cx: (Math.cos(angle) * radius).toFixed(2),
          cy: (Math.sin(angle) * radius).toFixed(2),
          r: 1.1,
          fill: '#B07636',
          class: 'flower-center'
        }));
      }
    },
    apricot(group, palette, addPetal, fill) {
      radial(addPetal, group, { count: 5, shape: 'round', length: 36, width: 21, fill });
      addStamens(group, 12, 17, palette.petalDeep, palette.center);
      group.append(svgEl('circle', { r: 5, fill: palette.center, class: 'flower-center' }));
    },
    peach(group, palette, addPetal, fill) {
      radial(addPetal, group, { count: 5, shape: 'round', length: 38, width: 22, fill });
      radial(addPetal, group, { count: 5, shape: 'round', length: 27, width: 16, fill: palette.petalDeep, offset: 36, attrs: { opacity: 0.85 } });
      addStamens(group, 10, 13, '#B83B5E', palette.center);
      group.append(svgEl('circle', { r: 4, fill: '#B83B5E', class: 'flower-center' }));
    },
    sakura(group, palette, addPetal, fill) {
      radial(addPetal, group, { count: 5, shape: 'notched', length: 38, width: 21, fill });
      addStamens(group, 8, 11, palette.petalDeep, palette.center);
      group.append(svgEl('circle', { r: 4, fill: palette.petalDeep, class: 'flower-center' }));
    },
    lily(group, palette, addPetal, fill) {
      radial(addPetal, group, { count: 3, shape: 'pointed', length: 46, width: 13, fill: palette.petalDeep, offset: 60 });
      radial(addPetal, group, { count: 3, shape: 'pointed', length: 44, width: 14, fill });
      for (let index = 0; index < 6; index += 1) {
        const angle = (index * 60 + 30) * (Math.PI / 180);
        const x = Math.sin(angle) * 22;
        const y = -Math.cos(angle) * 22;
        group.append(
          svgEl('line', { x1: 0, y1: 0, x2: x.toFixed(2), y2: y.toFixed(2), stroke: '#8DB37F', 'stroke-width': 1, class: 'stamen' }),
          svgEl('ellipse', { cx: x.toFixed(2), cy: y.toFixed(2), rx: 1.6, ry: 3.2, fill: '#B5651D', class: 'stamen', transform: `rotate(${index * 60 + 30} ${x.toFixed(2)} ${y.toFixed(2)})` })
        );
      }
      group.append(svgEl('circle', { r: 3.5, fill: palette.center, class: 'flower-center' }));
    },
    rose(group, palette, addPetal, fill) {
      radial(addPetal, group, { count: 5, shape: 'round', length: 42, width: 25, fill });
      radial(addPetal, group, { count: 5, shape: 'round', length: 31, width: 20, fill: palette.petal, offset: 36, attrs: { stroke: palette.petalDeep, 'stroke-width': 0.8 } });
      radial(addPetal, group, { count: 4, shape: 'round', length: 20, width: 14, fill: palette.petalDeep, offset: 18 });
      group.append(svgEl('path', {
        d: 'M0 0 C4 -3 7 1 4 5 C0 9 -7 6 -7 0 C-7 -7 2 -11 8 -7',
        fill: 'none',
        stroke: '#8E1240',
        'stroke-width': 1.6,
        'stroke-linecap': 'round',
        class: 'flower-center'
      }));
    },
    hydrangea(group, palette, addPetal) {
      group.append(svgEl('circle', { r: 33, fill: palette.petal, opacity: 0.45, class: 'flower-center' }));
      const florets = [[0, 0]];
      [[6, 14, 0], [11, 28, 15]].forEach(([count, radius, offset]) => {
        for (let index = 0; index < count; index += 1) {
          const angle = ((index * 360) / count + offset) * (Math.PI / 180);
          florets.push([Math.round(Math.sin(angle) * radius), Math.round(-Math.cos(angle) * radius)]);
        }
      });
      florets.forEach(([x, y], floretIndex) => {
        const floret = svgEl('g', { transform: `translate(${x} ${y})` });
        const color = floretIndex % 3 === 0 ? palette.petalDeep : palette.petal;
        radial(addPetal, floret, { count: 4, shape: 'round', length: 9.5, width: 7.5, fill: color, offset: floretIndex * 17, attrs: { stroke: '#FFFFFF', 'stroke-width': 0.6 } });
        floret.append(svgEl('circle', { r: 1.8, fill: palette.center, class: 'flower-center' }));
        group.append(floret);
      });
    },
    gypsophila(group, palette, addPetal) {
      const florets = [[0, -30], [-16, -26], [16, -25], [-28, -14], [28, -12], [-8, -14], [9, -12], [-20, 0], [20, 2], [0, -2], [-34, 6], [34, 8], [-10, 12], [12, 14]];
      florets.forEach(([x, y]) => {
        group.append(svgEl('path', {
          d: `M0 44 Q${(x * 0.4).toFixed(1)} ${(y + 44) / 2} ${x} ${y}`,
          fill: 'none',
          stroke: LEAF_GREEN,
          'stroke-width': 0.9,
          class: 'stamen'
        }));
      });
      florets.forEach(([x, y], floretIndex) => {
        const floret = svgEl('g', { transform: `translate(${x} ${y})` });
        radial(addPetal, floret, { count: 5, shape: 'round', length: 5.5, width: 3.8, fill: floretIndex % 4 === 0 ? palette.petalDeep : palette.petal, offset: floretIndex * 23, attrs: { stroke: '#E9B9CB', 'stroke-width': 0.5 } });
        floret.append(svgEl('circle', { r: 1.2, fill: '#E7A7BE', class: 'flower-center' }));
        group.append(floret);
      });
    },
    orchid(group, palette, addPetal, fill) {
      [0, 140, 220].forEach((rotation) => addPetal(group, 'pointed', 40, 11, fill, rotation));
      [68, 292].forEach((rotation) => addPetal(group, 'round', 33, 22, fill, rotation, { stroke: palette.petalDeep, 'stroke-width': 0.7 }));
      addPetal(group, 'round', 26, 17, palette.petalDeep, 180);
      group.append(
        svgEl('ellipse', { cx: 0, cy: 10, rx: 4, ry: 3, fill: palette.center, class: 'flower-center' }),
        svgEl('circle', { r: 4.5, fill: '#FFFFFF', stroke: palette.petalDeep, 'stroke-width': 0.8, class: 'flower-center' })
      );
    },
    magnolia(group, palette, addPetal, fill) {
      group.append(leaf(-4, 10, 40, 150, 'stamen'), leaf(4, 10, 40, 30, 'stamen'));
      [-6, 40, 92, 138, 186, 232, 280, 326].forEach((rotation, index) => {
        addPetal(group, 'pointed', index % 2 ? 40 : 44, 7.5, fill, rotation, { stroke: palette.petalDeep, 'stroke-width': 0.6 });
      });
      [20, 112, 204, 296].forEach((rotation) => {
        addPetal(group, 'pointed', 28, 7, palette.petal, rotation, { stroke: palette.petalDeep, 'stroke-width': 0.6 });
      });
      group.append(
        svgEl('ellipse', { rx: 3.6, ry: 8, fill: palette.center, class: 'flower-center' }),
        svgEl('ellipse', { rx: 3.6, ry: 8, fill: 'none', stroke: '#8FA23E', 'stroke-width': 0.8, 'stroke-dasharray': '1.2 1.6', class: 'flower-center' })
      );
    },
    lotus(group, palette, addPetal, fill) {
      group.append(
        svgEl('ellipse', { cx: 0, cy: 26, rx: 44, ry: 8, fill: LEAF_GREEN, class: 'stamen' }),
        svgEl('path', { d: 'M-44 26 Q0 36 44 26', fill: 'none', stroke: LEAF_DEEP, 'stroke-width': 1, class: 'stamen' })
      );
      const base = svgEl('g', { transform: 'translate(0 22)' });
      [-62, -32, 0, 32, 62].forEach((rotation) => addPetal(base, 'pointed', 44, 13, palette.petalDeep, rotation, { opacity: 0.9 }));
      [-44, -15, 15, 44].forEach((rotation) => addPetal(base, 'pointed', 36, 15, fill, rotation, { stroke: palette.petalDeep, 'stroke-width': 0.6 }));
      addPetal(base, 'pointed', 30, 12, palette.petal, 0, { stroke: palette.petalDeep, 'stroke-width': 0.6 });
      group.append(base, svgEl('ellipse', { cx: 0, cy: 6, rx: 6, ry: 3, fill: palette.center, class: 'flower-center' }));
    },
    milkflower(group, palette, addPetal) {
      for (let index = 0; index < 7; index += 1) {
        group.append(leaf(0, 0, 47, index * (360 / 7) + 14, 'stamen'));
      }
      const florets = [[0, 0]];
      [[6, 9.5, 0], [12, 19, 15], [14, 27.5, 6]].forEach(([count, radius, offset]) => {
        for (let index = 0; index < count; index += 1) {
          const angle = ((index * 360) / count + offset) * (Math.PI / 180);
          florets.push([(Math.sin(angle) * radius).toFixed(1), (-Math.cos(angle) * radius).toFixed(1)]);
        }
      });
      group.append(svgEl('circle', { r: 30, fill: palette.petalDeep, opacity: 0.35, class: 'flower-center' }));
      florets.forEach(([x, y], floretIndex) => {
        const floret = svgEl('g', { transform: `translate(${x} ${y})` });
        radial(addPetal, floret, { count: 5, shape: 'round', length: 6, width: 3.9, fill: palette.petal, offset: floretIndex * 29, attrs: { stroke: palette.petalDeep, 'stroke-width': 0.6 } });
        floret.append(svgEl('circle', { r: 1.3, fill: palette.center, class: 'flower-center' }));
        group.append(floret);
      });
    }
  };

  function buildFlowerGroup(type, palette) {
    const group = svgEl('g', { class: `flower-head flower-head--${type}` });
    const defs = svgEl('defs');
    group.append(defs);
    const fill = createPetalGradient(defs, palette);
    const addPetal = createPetalRenderer(group);
    const builder = builders[type] || builders.rose;
    builder(group, palette, addPetal, fill);
    return group;
  }

  function create(type, palette, options) {
    const { size = 96, bloom = false, className = '' } = options || {};
    const svg = svgEl('svg', {
      viewBox: '-50 -50 100 100',
      width: size,
      height: size,
      'aria-hidden': 'true',
      focusable: 'false',
      class: `flower ${bloom ? 'is-bloom' : ''} ${className}`.trim()
    });
    svg.append(buildFlowerGroup(type, palette));
    return svg;
  }

  const BOUQUET_LAYOUT = [
    { type: 'orchid', x: 200, y: 92, scale: 1, tip: [200, 130] },
    { type: 'daisy', x: 132, y: 126, scale: 0.95, tip: [138, 150] },
    { type: 'magnolia', x: 270, y: 128, scale: 0.95, tip: [268, 160] },
    { type: 'lily', x: 104, y: 214, scale: 1, tip: [116, 220] },
    { type: 'sakura', x: 296, y: 210, scale: 0.95, tip: [286, 218] },
    { type: 'peach', x: 146, y: 282, scale: 0.92, tip: [152, 288] },
    { type: 'gypsophila', x: 258, y: 286, scale: 0.95, tip: [254, 320] },
    { type: 'rose', x: 200, y: 206, scale: 1.32, tip: [200, 216] }
  ];

  function paletteFor(type) {
    const match = (app.recipients || []).find((recipient) => recipient.flowerType === type);
    return match ? match.palette : { petal: '#F8BBD0', petalDeep: '#E87A93', center: '#F3D18A', glow: '#FDE8EC' };
  }

  function createBouquet() {
    const svg = svgEl('svg', { viewBox: '30 20 340 480', class: 'bouquet', 'aria-hidden': 'true', focusable: 'false' });
    const defs = svgEl('defs');
    const wrapGradient = svgEl('linearGradient', { id: 'mx-wrap', x1: '0', y1: '0', x2: '1', y2: '1' });
    wrapGradient.append(
      svgEl('stop', { offset: '0%', 'stop-color': '#FFF6F1' }),
      svgEl('stop', { offset: '100%', 'stop-color': '#F4C4C8' })
    );
    const glowGradient = svgEl('radialGradient', { id: 'mx-bouquet-glow' });
    glowGradient.append(
      svgEl('stop', { offset: '0%', 'stop-color': '#FFFFFF', 'stop-opacity': 0.9 }),
      svgEl('stop', { offset: '100%', 'stop-color': '#FFFFFF', 'stop-opacity': 0 })
    );
    defs.append(wrapGradient, glowGradient);
    svg.append(defs, svgEl('circle', { cx: 200, cy: 210, r: 170, fill: 'url(#mx-bouquet-glow)' }));

    svg.append(svgEl('path', { d: 'M96 300 L304 300 L234 470 L166 470Z', fill: '#F1CFC8', class: 'bouquet-wrap' }));

    const stems = svgEl('g', { class: 'bouquet-stems' });
    BOUQUET_LAYOUT.forEach((flower, index) => {
      const [tipX, tipY] = flower.tip;
      const controlX = (200 + tipX) / 2 + (tipX - 200) * 0.25;
      stems.append(svgEl('path', {
        d: `M200 440 Q${controlX} ${(440 + tipY) / 2} ${tipX} ${tipY}`,
        pathLength: 1,
        fill: 'none',
        stroke: index % 2 ? LEAF_DEEP : '#5E9A63',
        'stroke-width': 3,
        'stroke-linecap': 'round',
        class: 'stem',
        style: `--delay:${index * 90}ms`
      }));
    });
    [[146, 334, -150, 50], [256, 334, -30, 50], [176, 362, -125, 40], [226, 364, -55, 40], [200, 330, -95, 36]].forEach(([x, y, rotation, length], index) => {
      const leafElement = leaf(x, y, length, rotation, 'bouquet-leaf');
      leafElement.setAttribute('style', `--delay:${700 + index * 80}ms`);
      stems.append(leafElement);
    });
    svg.append(stems);

    BOUQUET_LAYOUT.forEach((flower, index) => {
      const holder = svgEl('g', { transform: `translate(${flower.x} ${flower.y}) scale(${flower.scale})` });
      const sway = svgEl('g', { class: 'bouquet-sway', style: `--sway-delay:${index * -0.7}s` });
      const head = buildFlowerGroup(flower.type, paletteFor(flower.type));
      head.setAttribute('style', `--delay:${900 + index * 160}ms`);
      sway.append(head);
      holder.append(sway);
      svg.append(holder);
    });

    svg.append(
      svgEl('path', { d: 'M66 296 Q200 346 334 296 L242 474 Q200 486 158 474Z', fill: 'url(#mx-wrap)', stroke: '#E8B4B0', 'stroke-width': 1.5, class: 'bouquet-wrap' }),
      svgEl('path', { d: 'M200 322 L200 474', stroke: '#EDC2BE', 'stroke-width': 1, fill: 'none', class: 'bouquet-wrap' }),
      svgEl('path', { d: 'M200 400 C170 374 140 380 146 400 C152 420 182 414 200 400Z', fill: '#B83B5E', class: 'bouquet-ribbon' }),
      svgEl('path', { d: 'M200 400 C230 374 260 380 254 400 C248 420 218 414 200 400Z', fill: '#B83B5E', class: 'bouquet-ribbon' }),
      svgEl('path', { d: 'M196 404 L178 456 L190 450 L196 460Z M204 404 L222 456 L210 450 L204 460Z', fill: '#C9963B', class: 'bouquet-ribbon' }),
      svgEl('circle', { cx: 200, cy: 401, r: 8, fill: '#E31F26', stroke: '#F3D18A', 'stroke-width': 2, class: 'bouquet-ribbon' })
    );
    return svg;
  }


  app.flowers = Object.freeze({ create, createBouquet });
})(window.MindxGift = window.MindxGift || {});
