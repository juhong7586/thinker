import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function CreativityScatter({ studentRows }) {
  const svgRef = useRef();
  const [selectedMetric, setSelectedMetric] = useState('ave_cr');

  useEffect(() => {
    const loadData = async () => {
      let rawData = null;
      if (Array.isArray(studentRows) && studentRows.length) {
        rawData = studentRows;
      } else {
        console.error('No studentRows data available for ScatterPlot');
        return;
        }
      
      let data, yLabel, yDomain, regression;

      if (selectedMetric === 'ave_cr') {
        data = rawData.filter(item => !isNaN(item.ave_cr) && !isNaN(item.ave_emp));
        yLabel = 'Creativity (Overall)';
        yDomain = [0, 2.2];
        regression = { slope: 0.11, intercept: 0.86 };
      } else {
        data = rawData.filter(item => !isNaN(item.ave_cr_social) && !isNaN(item.ave_emp));
        yLabel = 'Creativity (Social Problem Solving)';
        yDomain = [0, 2.2];
        regression = { slope: 0.09, intercept: 0.75 };
      }

      const { slope, intercept } = regression;

      const margin = { top: 30, right: 30, bottom: 60, left: 60 };
      const width = 800 - margin.left - margin.right;
      const height = 550 - margin.top - margin.bottom;

      // Clear previous content
      d3.select(svgRef.current).selectAll("*").remove();

      const svg = d3.select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Scales
      const xScale = d3.scaleLinear()
        .domain([0, 5])
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain(yDomain)
        .range([height, 0]);

      // Axes
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);

      g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .append('text')
        .attr('y', 55)
        .attr('x', width / 2)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .text('Average Empathy');

      g.append('g')
        .call(yAxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .text(yLabel);

      // Add grid lines
      g.append('g')
        .attr('class', 'grid')
        .attr('opacity', 0.1)
        .call(d3.axisLeft(yScale)
          .tickSize(-width)
          .tickFormat('')
        );     

      // g.append('line')
      //   .attr('x1', xScale(trendLineData[0].x))
      //   .attr('y1', yScale(trendLineData[0].y))
      //   .attr('x2', xScale(trendLineData[1].x))
      //   .attr('y2', yScale(trendLineData[1].y))
      //   .attr('stroke', '#ff7300')
      //   .attr('stroke-width', 2)
      //   .attr('opacity', 0.8)
      //   .attr('stroke-dasharray', '5,5');

      // Add scatter points
      const yDataKey = selectedMetric === 'ave_cr' ? 'ave_cr' : 'ave_cr_social';

      // Compute a min/max envelope across x by binning the data along ave_emp.
      // This produces a shaded area between min and max y for each x-bin.
      const bins = d3.bin()
        .domain(xScale.domain())
        .thresholds(80) // adjust number of bins for smoothness/detail
        .value(d => d.ave_emp)(data);

      const envelope = bins
        .map(bin => {
          if (!bin.length) return null;
          const xCenter = (bin.x0 + bin.x1) / 2;
          return {
            x: xCenter,
            min: d3.min(bin, d => d[yDataKey]),
            max: d3.max(bin, d => d[yDataKey]),
            avg: d3.mean(bin, d => d[yDataKey]),
            count: bin.length
          };
        })
        .filter(d => d !== null)
        .sort((a, b) => a.x - b.x);

      const area = d3.area()
        .x(d => xScale(d.x))
        .y0(d => yScale(d.min))
        .y1(d => yScale(d.max))
        .curve(d3.curveCatmullRom.alpha(0.02));

      g.append('path')
        .datum(envelope)
        .attr('fill', '#888888')
        .attr('fill-opacity', 0.25)
        .attr('stroke', 'none')
        .attr('d', area);


      // Add max line 
      const lineMax = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.max))
        .curve(d3.curveCatmullRom.alpha(0.02));

      g.append('path')
        .datum(envelope)
        .attr('fill', 'none')
        .attr('stroke', '#CCC')
        .attr('stroke-width', 1)
        .attr('stroke-linecap', 'round')
        .attr('d', lineMax);    

      // Add min line
      const lineMin = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.min))
        .curve(d3.curveCatmullRom.alpha(0.02));

      g.append('path')
        .datum(envelope)
        .attr('fill', 'none')
        .attr('stroke', '#AAAAAA')
        .attr('stroke-width', 1)
        .attr('stroke-linecap', 'round')
        .attr('d', lineMin);

      // Draw average line as segmented lines with thickness proportional to bin count
      // To make thickness changes smoother, compute a short-window smoothed count per envelope point
      const counts = envelope.map(d => d.count || 0);
      const smoothed = counts.map((c, i) => {
        const prev = counts[i - 1] || 0;
        const next = counts[i + 1] || 0;
        return (prev + c + next) / 3; // simple 3-point moving average
      });
      const maxSmoothed = d3.max(smoothed) || 1;

      for (let i = 0; i < envelope.length - 1; i++) {
        const d = envelope[i];
        const nextD = envelope[i + 1];
        // thickness based on average of smoothed counts at the two segment endpoints
        const avgSm = (smoothed[i] + smoothed[i + 1]) / 2;
        const thickness = 2 + (avgSm / maxSmoothed) * 8; // base 2px + scaled

        g.append('line')
          .attr('x1', xScale(d.x))
          .attr('y1', yScale(d.x * slope + intercept))
          .attr('x2', xScale(nextD.x))
          .attr('y2', yScale(nextD.x * slope + intercept))
          .attr('stroke', '#ff7300')
          .attr('stroke-width', thickness)
          .attr('stroke-linecap', 'round')
          .attr('opacity', 0.95);
      }



        // Add title
      svg.append('text')
        .attr('x', (width + margin.left + margin.right) / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text(`Empathy on ${yLabel}`);

      // Add legend
      const legend = svg.append('g')
        .attr('transform', `translate(${margin.left + 20}, ${margin.top + 20})`);


      legend.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 20)
        .attr('y2', 20)
        .attr('stroke', '#ff7300')
        .attr('stroke-width', 2);
      legend.append('text')
        .attr('x', 25)
        .attr('y', 25)
        .attr('font-size', '12px')
        .text('Trend Line');

    };
    loadData().catch(err => console.error('Failed to load data for ScatterPlot:', err));
  }, [selectedMetric, studentRows]);

  return (
    <div style={{ width: '100%', minHeight: '80vh', padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ padding: '30px' }}>
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <label style={{ marginRight: '20px', fontSize: '16px', fontWeight: 'bold' }}>
            Select Creativity Metric:
          </label>
          <select 
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="ave_cr">Creativity (Overall)</option>
            <option value="ave_cr_social">Creativity (Social Problem Solving)</option>
          </select>
        </div>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}