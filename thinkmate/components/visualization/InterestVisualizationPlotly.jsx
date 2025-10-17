import React, { useRef, useState, useEffect } from 'react';
import Plot from 'react-plotly.js';


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
}) {
  const traces = [];
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

  nodes.forEach((n) => {
    const x = n._x ?? n.x ?? 0;
    const y = n._y ?? n.y ?? 0;
    const baseR = clamp(Math.round((n._r ?? 10) * 4), 6, 400);
    const colors = (n.colors || []).filter(Boolean);
    // determine if current logged-in student contributed to this node
    const contributors = (n.original && n.original.contributors) || [];
    const userStudentId = currentUser ? String(currentUser.id ?? currentUser.studentId ?? currentUser.user?.id ?? currentUser.userId) : null;
    const isMine = userStudentId && contributors.map(String).includes(userStudentId);
    const hover = `${n.field || ''}<br>${n.original?.avgLevel ?? ''}/${n.original?.avgSocialImpact ?? ''}`;
    if (!colors.length || colors.length === 1) {
      single.x.push(x); single.y.push(y); single.size.push(baseR);
      const fill = isMine ? (colors[0] || (currentUser && (currentUser.studentColor || currentUser.student?.studentColor)) || '#FFB347') : '#BDBDBD';
      single.color.push(colorWithAlpha(fill, 0.7)); single.lineColor.push(isMine ? '#222222' : '#ffffff');
      single.lineWidth.push(isMine ? 2 : 1); single.text.push(hover);
    } else {
      traces.push({
        x: [x], y: [y], mode: 'markers+text',
        marker: { size: clamp(baseR * 0.9, 4, baseR), color: colorWithAlpha('#FFFFFF', 0.8)},
        text: [hover], hoverinfo: 'text', showlegend: false, textfont: { family: 'NanumSquareNeo', size: 15, color: '#222' }
      });
      const ringCount = Math.min(colors.length, maxRings);
      for (let j = 0; j < ringCount; j++) {
        const color = colors[j];
        const size = clamp(baseR * (1 + j * 0.05), baseR * 0.9, baseR * (1 + ringCount * 0.05));
        traces.push({
          x: [x], y: [y], mode: 'markers',
          marker: { size, color: 'rgba(0,0,0,0)', line: { color: isMine ? (color || (currentUser && (currentUser.studentColor || currentUser.student?.studentColor)) || '#FFB347') : '#BDBDBD', width: isMine ? 2 : 3 } },
          text: [hover], hoverinfo: 'text', showlegend: false, textfont: { size: 15, color: '#222' }
        });
      }
    }
  });

  if (single.x.length) {
    traces.unshift({
      x: single.x, y: single.y, mode: 'markers+text',
      marker: { size: single.size, color: single.color, line: { color: single.lineColor, width: single.lineWidth } },
      text: single.text, hoverinfo: 'text', showlegend: false, textfont: { family: 'NanumSquareNeo', size: 15, color: '#222' }
    });
  }
  const layout = {
    width, height, margin: { l: 20, r: 20, t: 20, b: 20 },
    // categorical labels for social impact along x axis
    // user-provided categories
    // Note: if `width` is not numeric we fall back to 1000px for tick positioning
    xaxis: (() => {
      const xRange = ['Self', 'Family', 'Friends', 'Class', 'School', 'Community', 'City', 'Country', 'World'];
      const axisWidth = (typeof width === 'number' && Number.isFinite(width)) ? width : (width - 100);
      const tickvals = xRange.map((_, i) => (i / (xRange.length - 1)) * axisWidth);
      return { visible: true, range: [0, axisWidth], tickmode: 'array', tickvals, ticktext: xRange, tickangle: 0, tickfont: { family: 'NanumSquareNeo', size: 12, color: '#222' } };
    })(),
    yaxis: { visible: false, range: flipY ? [height, 0] : [0, height], scaleanchor: 'x', scaleratio: 1, tickfont: { family: 'NanumSquareNeo', size: 12, color: '#222' } },
    hovermode: 'closest', paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', font: { family: 'NanumSquareNeo', size: 12, color: '#222' }, hoverlabel: { font: { family: 'NanumSquareNeo', size: 12, color: '#222' } }
  };

  const config = { responsive: true, displayModeBar: true, displaylogo: false, modeBarButtonsToRemove: ['toImage', 'sendDataToCloud', 'editInChartStudio', 'zoom2d', 'select2d', 'pan2d', 'lasso2d', 'autoScale2d', 'resetScale2d', 'zoomIn2d', 'zoomOut2d'] };

  return (
    <Plot
      data={traces}
      layout={layout}
      config={config}
      style={{ width: width, height: height }}
      useResizeHandler={true}
    />
  );
}