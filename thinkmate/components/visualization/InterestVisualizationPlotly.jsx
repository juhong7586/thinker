import React, { useRef, useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { forceSimulation, forceCollide, forceX, forceY } from 'd3-force';
import { type } from 'os';


const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// return an rgba(...) string with the requested alpha. Accepts #RRGGBB, #RGB, rgb(...) or rgba(...)
const colorWithAlpha = (col, alpha = 0.8) => {
  if (!col) return `rgba(189,189,189,${alpha})`;
  const s = String(col).trim();
  try {
    if (s.startsWith('rgba')) {
      // replace alpha
      return s.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `rgba($1,$2,$3,${alpha})`);
    }
    if (s.startsWith('rgb(')) {
      const nums = s.match(/rgb\(([^)]+)\)/)[1];
      return `rgba(${nums},${alpha})`;
    }
    // hex formats
    const hex = s.replace('#', '');
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0,2), 16);
      const g = parseInt(hex.slice(2,4), 16);
      const b = parseInt(hex.slice(4,6), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }
  } catch (e) {
    // fallthrough
  }
  return s; // fallback, might already include alpha
}



export default function InterestVisualizationPlotly({
  nodes = [],
  width = {propWidth},
  height = {propHeight},
  maxRings = 6,
  flipY = true,
  aiResult = null,
}) {
  const gdRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('thinkmate_user');
      if (raw) setCurrentUser(JSON.parse(raw));
    } catch (e) {
      setCurrentUser(null);
    }
  }, []);

  const single = { x: [], y: [], size: [], color: [], lineColor: [], lineWidth: [], text: [] };
  // memoize heavy computation: positions, simulation, and trace building
  const { traces: memoTraces, layout, config } = React.useMemo(() => {
    const padding = 70;

    // compute numeric width/height fallback (handles string props)
    const numericWidth = (typeof width === 'number' && Number.isFinite(width)) ? width : (typeof window !== 'undefined' ? window.innerWidth : 1200);
    const numericHeight = (typeof height === 'number' && Number.isFinite(height)) ? height : (typeof window !== 'undefined' ? window.innerHeight : 1000);

    // prepare processed nodes
    const processed = nodes.map((n) => {
      const minXLevel = 1, maxXLevel = 9;
      const interest = Number(n.original?.avgSocialImpact ?? n.interest ?? minXLevel);
      const xNorm = Math.max(0, Math.min(1, (interest - minXLevel) / (maxXLevel - minXLevel)));
      const x = padding + xNorm * (numericWidth - 2 * padding);

      const minLevel = 1, maxLevel = 10;
      const level = Number(n.original?.avgLevel ?? n.level ?? minLevel);
      const norm = Math.max(0, Math.min(1, (level - minLevel) / (maxLevel - minLevel)));
      const y = padding + (1 - norm) * (numericHeight - 2 * padding);

      const baseR = clamp(Math.round((n._r ?? 10) * 4), 6, 400);
      const colors = (n.colors || []).filter(Boolean);
      const contributors = (n.original && n.original.contributors) || [];
      const userStudentId = currentUser ? String(currentUser.id ?? currentUser.studentId ?? currentUser.user?.id ?? currentUser.userId) : null;
      const isMine = userStudentId && contributors.map(String).includes(userStudentId);
      const hover = `${n.field || ''}<br>${n.original?.avgSocialImpact ?? ''}/${n.original?.avgLevel ?? ''}`;

      return {
        original: n,
        _x: x,
        _y: y,
        _size: baseR,
        colors,
        isMine,
        hover,
        field: n.field,
      };
    });

    // run a short d3-force sim to resolve collisions (only when nodes exist)
    if (processed.length > 0) {
      try {
        const simNodes = processed.map(p => ({ x: p._x, y: p._y, radius: (p._size ?? 10) / 2 }));
        const sim = forceSimulation(simNodes)
          .stop()
          .force('x', forceX(d => d.x).strength(0.2))
          .force('y', forceY(d => d.y).strength(0.2))
          .force('collide', forceCollide(d => d.radius + 4).iterations(2));

        const ticks = processed.length > 500 ? 20 : 60;
        for (let i = 0; i < ticks; i++) sim.tick();

        simNodes.forEach((sn, idx) => {
          const p = processed[idx];
          if (typeof sn.x === 'number') p._x = sn.x;
          if (typeof sn.y === 'number') p._y = sn.y;
        });
        sim.stop();
      } catch (e) {
        // keep processed positions if simulation fails
        console.error('d3-force simulation failed', e);
      }
    }
    const candidates = [];
    // build traces
    const traces = [];
    const singleTrace = { x: [], y: [], size: [], color: [], lineColor: [], lineWidth: [], text: [] };
    processed.forEach(p => {
      const { _x, _y, _size, colors, isMine, hover } = p;
      if (!colors.length || colors.length === 1) {
        const fill = isMine ? (colors[0] || (currentUser && (currentUser.studentColor || currentUser.student?.studentColor)) || '#FFB347') : '#BDBDBD';
        singleTrace.x.push(_x); singleTrace.y.push(_y); singleTrace.size.push(_size);
        singleTrace.color.push(colorWithAlpha(fill, 0.7)); singleTrace.lineColor.push(isMine ? '#222222' : '#ffffff');
        singleTrace.lineWidth.push(isMine ? 2 : 1); singleTrace.text.push(hover);
      } else {
        traces.push({
          x: [_x], y: [_y], mode: 'markers+text',
          marker: { size: clamp(_size * 0.9, 4, _size), color: colorWithAlpha('#FFFFFF', 0.8)},
          text: [hover], hoverinfo: 'text', showlegend: false, textfont: { family: 'NanumSquareNeo', size: 15, color: '#222' }
        });
        const ringCount = Math.min(colors.length, maxRings);
        for (let j = 0; j < ringCount; j++) {
          const color = colors[j];
          const size = clamp(_size * (1 + j * 0.05), _size * 0.9, _size * (1 + ringCount * 0.05));
          traces.push({
            x: [_x], y: [_y], mode: 'markers',
            marker: { size, color: 'rgba(0,0,0,0)', line: { color: isMine ? (color || (currentUser && (currentUser.studentColor || currentUser.student?.studentColor)) || '#FFB347') : '#BDBDBD', width: isMine ? 2 : 3 } },
            text: [hover], hoverinfo: 'text', showlegend: false, textfont: { size: 15, color: '#222' }
          });
        }
      }
    });

    if (singleTrace.x.length) {
      traces.unshift({
        x: singleTrace.x, y: singleTrace.y, mode: 'markers+text',
        marker: { size: singleTrace.size, color: singleTrace.color, line: { color: singleTrace.lineColor, width: singleTrace.lineWidth } },
        text: singleTrace.text, hoverinfo: 'text', showlegend: false, textfont: { family: 'NanumSquareNeo', size: 15, color: '#222' }
      });
    }
    const xRange = ['Self', 'Family', 'Friends', 'Class', 'School', 'Community', 'City', 'Country', 'World'];
    const n = xRange.length;

    const bPaper = [];
    for (let i = 0; i <= n; i++) bPaper.push(i / n);

      // tick positions = centers in paper coords
    const centersPaper = [];
    for (let i = 0; i < n; i++) centersPaper.push((bPaper[i] + bPaper[i+1]) / 2);


    // compute axis layout and set tick positions to centers (so labels appear between separators)
    const layout = {
      width: numericWidth,
      height: numericHeight,
      margin: { l: 20, r: 20, t: 20, b: 20 },
      xaxis: (() => {
        const axisWidth = numericWidth;
        // centersPaper are fractions 0..1; convert to data-space tick positions
        const centersData = centersPaper.map(c => c * axisWidth);
        return { visible: true, range: [0, axisWidth], tickmode: 'array', tickvals: centersData, ticktext: xRange, tickangle: 0, tickfont: { family: 'NanumSquareNeo', size: 16, color: '#222' } };
      })(),
      yaxis: (() => {
        const yRange = [0,1,2,3,4,5,6,7,8,9,10];
        const axisHeight = numericHeight - 100;
        const tickvals = yRange.map((_, i) => (i / (yRange.length - 1)) * axisHeight);
        return { visible: false, range: flipY? [axisHeight,0] : [0, axisHeight], tickmode: 'array', tickvals, ticktext: yRange, tickangle: 0, tickfont: { family: 'NanumSquareNeo', size: 12, color: '#222' } };
      })(),
      hovermode: 'closest', paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', font: { family: 'NanumSquareNeo', size: 12, color: '#222' }, hoverlabel: { font: { family: 'NanumSquareNeo', size: 12, color: '#222' } }
    };

    // If an AI result is provided, add highlighted rectangles for any matching categories
    if (aiResult) {
      try {
        const raw = (typeof aiResult === 'string') ? aiResult : (aiResult.reply || JSON.stringify(aiResult));
        const lower = String(raw).toLowerCase();
        const matched = [];
        // find which categories are mentioned
        xRange.forEach((label, idx) => {
          if (lower.includes(label.toLowerCase())) matched.push(idx);
        });

        if (matched.length) {
          layout.shapes = layout.shapes || [];
          // push one rectangle per matched index using paper coords (bPaper)
          matched.forEach(idx => {
            const start = bPaper[idx];
            const end = bPaper[idx + 1];
            layout.shapes.push({
              type: 'rect',
              xref: 'paper',
              yref: 'paper',
              x0: start,
              y0: 0,
              x1: end,
              y1: 1,
              fillcolor: 'rgba(255,238,140, 0.3)',
              opacity: 0.7,
              line: { color: '#ddd', width: 1 },
              layer: 'below'
            });
          });
          console.log('AI highlighted categories:', matched.map(i => xRange[i]).join(', '));
        }
      
        const text = String(raw || '');
        const lines = text.split(/\r?\n/);
        const itemRe = /^\s*(\d+)[\.)]\s*(.*)$/; // matches '4. something' or '4) something'
        const items = {};
        let cur = null;
        for (let ln of lines) {
          const m = ln.match(itemRe);
          if (m) {
            cur = Number(m[1]);
            items[cur] = (items[cur] || '') + m[2].trim();
          } else if (cur !== null) {
            const t = ln.trim();
            if (t) items[cur] = items[cur] + ' ' + t;
          }
        }
        const item4 = items[4] || '';
        // Prefer extracting quoted words (e.g. 'Mindfulness') from item4
        const seen = new Set();
        const pushIfNew = (v) => { const t = String(v||'').trim(); if (t && !seen.has(t)) { seen.add(t); candidates.push(t); } };
        // extract single-quoted items
        try {
          const singleRe = /'([^']+)'/g;
          let m;
          while ((m = singleRe.exec(item4)) !== null) pushIfNew(m[1]);
          // also check double-quoted items
          const doubleRe = /"([^"]+)"/g;
          while ((m = doubleRe.exec(item4)) !== null) pushIfNew(m[1]);
        } catch (e) {
          // ignore
        }
        // fallback: if no quoted items found, split by common separators
        if (candidates.length === 0 && item4) {
          item4.split(/[;,\/\n]+/).map(s => s.trim()).filter(Boolean).forEach(s => pushIfNew(s));
        }
        console.log('AI suggested topics:', candidates);
        
        // distribute candidate circles horizontally across the plot area (between padding and width-padding)
        const startX = padding;
        const endX = (numericWidth - padding);
        const bottomY = numericHeight - padding*2; // place near bottom
        const canCircles = candidates.map((c, i) => {
          const count = Math.max(1, candidates.length);
          const xPos = count === 1 ? (numericWidth / 2) : (startX + (i / (count - 1)) * (endX - startX));
          return { original: c, _x: xPos, _y: bottomY, _size: 30, colors: [], isMine: false, hover: `${c}`, field: c };
        });

        // convert candidate objects into tiny, light-gray marker traces and add them
        const smallTraces = canCircles.map(c => ({
          x: [c._x], y: [c._y], mode: 'markers+text',
          marker: { size: Math.max(6, Math.round(c._size)), color: 'rgba(255, 255, 255, 0.0)', line: { color: '#FFEE8C', width: 2 } },
          text: [c.field], textposition: 'top center', textfont: { family: 'NanumSquareNeo', size: 11, color: '#444' },
          hoverinfo: 'text', showlegend: false
        }));

        // add smallTraces after other traces so they render on top
        traces.push(...smallTraces);

        
      } catch (e) {
        // ignore parsing errors
      }
    };
    

    
    const config = { responsive: true, displayModeBar: true, displaylogo: false, modeBarButtonsToRemove: ['toImage', 'sendDataToCloud', 'editInChartStudio', 'zoom2d', 'select2d', 'pan2d', 'lasso2d', 'autoScale2d', 'resetScale2d', 'zoomIn2d', 'zoomOut2d'] };

    return { traces, layout, config };
  }, [nodes, width, height, maxRings, flipY, currentUser, aiResult]);
  // use memoized results from computation

  return (
    <Plot
      data={memoTraces}
      layout={layout}
      config={config}
      style={{ width: width, height: height }}
      useResizeHandler={true}
    />
  );

  
}