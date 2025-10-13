import React from 'react';
import Plot from 'react-plotly.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export default function InterestVisualizationPlotly({
  nodes = [],
  width = 900,
  height = 600,
  maxRings = 6,
  flipY = true,
}) {
  const traces = [];
  const single = { x: [], y: [], size: [], color: [], lineColor: [], lineWidth: [], text: [] };

  nodes.forEach((n) => {
    const x = n._x ?? n.x ?? 0;
    const y = n._y ?? n.y ?? 0;
    const baseR = clamp(Math.round((n._r ?? 10) * 3), 6, 400);
    const colors = (n.colors || []).filter(Boolean);
    const hover = `${n.field || ''}<br/>count: ${n.original?.count ?? ''}<br/>avgLevel: ${n.original?.avgLevel ?? ''}<br/>impact: ${n.original?.avgSocialImpact ?? ''}`;

    if (!colors.length || colors.length === 1) {
      single.x.push(x); single.y.push(y); single.size.push(baseR);
      single.color.push(colors[0] || '#999999'); single.lineColor.push('#ffffff');
      single.lineWidth.push(1); single.text.push(hover);
    } else {
      traces.push({
        x: [x], y: [y], mode: 'markers',
        marker: { size: clamp(baseR * 0.8, 4, baseR), color: '#fff', line: { color: colors[0] || '#000', width: 1 } },
        text: [hover], hoverinfo: 'text', showlegend: false
      });
      const ringCount = Math.min(colors.length, maxRings);
      for (let j = 0; j < ringCount; j++) {
        const color = colors[j];
        const size = clamp(baseR * (0.9 + j * 0.15), baseR * 0.9, baseR * (1 + ringCount * 0.15));
        traces.push({
          x: [x], y: [y], mode: 'markers',
          marker: { size, color: 'rgba(0,0,0,0)', line: { color, width: 2 + j } },
          text: [hover], hoverinfo: 'text', showlegend: false
        });
      }
    }
  });

  if (single.x.length) {
    traces.unshift({
      x: single.x, y: single.y, mode: 'markers',
      marker: { size: single.size, color: single.color, line: { color: single.lineColor, width: single.lineWidth } },
      text: single.text, hoverinfo: 'text', showlegend: false
    });
  }

  const layout = {
    width, height, margin: { l: 20, r: 20, t: 20, b: 20 },
    xaxis: { visible: false, range: [0, width] },
    yaxis: { visible: false, range: flipY ? [height, 0] : [0, height], scaleanchor: 'x', scaleratio: 1 },
    hovermode: 'closest', paper_bgcolor: 'transparent', plot_bgcolor: 'transparent'
  };

  const config = { responsive: true, displayModeBar: true, displaylogo: false };

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