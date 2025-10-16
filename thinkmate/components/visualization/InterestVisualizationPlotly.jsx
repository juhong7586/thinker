import React, { useRef, useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export default function InterestVisualizationPlotly({
  nodes = [],
  width = 1100,
  height = 700,
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

  const [points, setPoints] = useState(() => {
    if (nodes && nodes.length) {
      return nodes.map((n, i) => ({
        name: n.interest?.name || n.field || n.label || `item ${i + 1}`,
        x: n._x ?? n.x ?? 0,
        y: n._y ?? n.y ?? 0,
        colors: (n.colors || n.colors[0]) || 'rgb(190, 190, 190)',
        lineWidth: 0,
      }));
    }
    const N = 12; 
    const bottomY = 5; 
    return Array.from({ length: N }, (_, i) => ({
      name: `Interest ${i + 1}`,
      x: Math.round(5 + i * (90 / (N - 1))),
      y: bottomY,
      color: 'rgb(190,190,190)',
      lineWidth: 0,
    }));
  });
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
      single.color.push(fill); single.lineColor.push(isMine ? '#222222' : '#ffffff');
      single.lineWidth.push(isMine ? 2 : 1); single.text.push(hover);
    } else {
      traces.push({
        x: [x], y: [y], mode: 'markers+text',
        marker: { size: clamp(baseR * 0.9, 4, baseR), color: isMine ? (colors[0] || (currentUser && (currentUser.studentColor || currentUser.student?.studentColor)) || '#FFB347') : '#FFFFFF', line: { color: isMine ? (colors[0] || '#222') : '#BBBBBB', width: isMine ? 2 : 1 } },
        text: [hover], hoverinfo: 'text', showlegend: false, textfont: { size: 20, color: '#222' }
      });
      const ringCount = Math.min(colors.length, maxRings);
      for (let j = 0; j < ringCount; j++) {
        const color = colors[j];
        const size = clamp(baseR * (1 + j * 0.15), baseR * 0.9, baseR * (1 + ringCount * 0.1));
        traces.push({
          x: [x], y: [y], mode: 'markers',
          marker: { size, color: 'rgba(0,0,0,0)', line: { color: isMine ? color : '#BBBBBB', width: isMine ? 4 : 3 } },
          text: [hover], hoverinfo: 'text', showlegend: false, textfont: { size: 20, color: '#222' }
        });
      }
    }
  });

  if (single.x.length) {
    traces.unshift({
      x: single.x, y: single.y, mode: 'markers+text',
      marker: { size: single.size, color: single.color, line: { color: single.lineColor, width: single.lineWidth } },
      text: single.text, hoverinfo: 'text', showlegend: false, textfont: { size: 17, color: '#222' }
    });
  }

  const layout = {
    width, height, margin: { l: 20, r: 20, t: 20, b: 20 },
    xaxis: { visible: true, range: [0, width] },
    yaxis: { visible: false, range: flipY ? [height, 0] : [0, height], scaleanchor: 'x', scaleratio: 1 },
    hovermode: 'closest', paper_bgcolor: 'transparent', plot_bgcolor: 'transparent'
  };

  const config = { responsive: true, displayModeBar: false, displaylogo: true, modeBarButtonsToRemove: ['toImage', 'sendDataToCloud', 'editInChartStudio', 'zoom2d', 'select2d', 'pan2d', 'lasso2d', 'autoScale2d', 'resetScale2d', 'zoomIn2d', 'zoomOut2d'] };

  return (
    <Plot
      data={traces}
      layout={layout}
      config={config}
      style={{ width: '100%', height: '100%' }}
      useResizeHandler={true}
    />
  );
}