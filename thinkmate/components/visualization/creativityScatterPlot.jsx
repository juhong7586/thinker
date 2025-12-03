import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function CreativityScatter({ studentRows }) {
  const svgRef = useRef();
  const [selectedMetric, setSelectedMetric] = useState('both');

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
      const showBoth = selectedMetric === 'both';



      if (selectedMetric === 'ave_cr' || showBoth) {
        data = rawData.filter(item => !isNaN(item.ave_cr) && !isNaN(item.ave_emp));
        yLabel = showBoth ? 'Creativity (Overall & Social)' : 'Creativity (Overall)';
      } else {
        data = rawData.filter(item => !isNaN(item.ave_cr_social) && !isNaN(item.ave_emp));
        yLabel = 'Creativity (Social Problem Solving)';     
      }
      yDomain = [0, 2.2];

      const yKey = (selectedMetric === 'ave_cr' || showBoth) ? 'ave_cr' : 'ave_cr_social';
      // Build datasets for each metric
      const dataCr = rawData.filter(d => !isNaN(d.ave_cr) && !isNaN(d.ave_emp));
      const dataSocial = rawData.filter(d => !isNaN(d.ave_cr_social) && !isNaN(d.ave_emp));

      // helper to compute a linear regression {slope, intercept}
      const calcRegression = (dataset, key) => {
        const m = dataset.length;
        if (m < 2) return { slope: 0, intercept: 0 };
        const sumX = d3.sum(dataset, d => d.ave_emp);
        const sumY = d3.sum(dataset, d => d[key]);
        const sumXY = d3.sum(dataset, d => d.ave_emp * d[key]);
        const sumX2 = d3.sum(dataset, d => d.ave_emp * d.ave_emp);
        const slope = (m * sumXY - sumX * sumY) / (m * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / m;
        return { slope, intercept };
      };

      const regPrimary = calcRegression(dataCr, 'ave_cr');
      const regOther = calcRegression(dataSocial, 'ave_cr_social');

      // choose primary regression depending on selection
      const { slope = 0, intercept = 0 } = (selectedMetric === 'ave_cr' || showBoth) ? regPrimary : regOther;

      const margin = { top: 30, right: 30, bottom: 60, left: 60 };
      const width = 500 - margin.left - margin.right;
      const height = 550 - margin.top - margin.bottom;

      // Clear previous content
      d3.select(svgRef.current).selectAll("*").remove();

      const svg = d3.select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      if (data.length === 0) {
        g.append('text').attr('x', w / 2).attr('y', h / 2).attr('text-anchor', 'middle').attr('fill', '#666').text('Please select a country first.');
        return;
      }
      
      // Scales
      const xScale = d3.scaleLinear()
        .domain([1, 5])
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

      // Add scatter points
      const yDataKey = yKey;

      // Create base bins across all rows that have ave_emp so both envelopes align
      const baseBins = d3.bin()
        .domain(xScale.domain())
        .thresholds(80)
        .value(d => d.ave_emp)(rawData.filter(d => !isNaN(d.ave_emp)));

      const buildEnvelope = (binsSource, key) => binsSource
        .map(bin => {
          const vals = bin.filter(d => d[key] != null && !isNaN(d[key]));
          if (!vals || vals.length === 0) return null;
          const xCenter = (bin.x0 + bin.x1) / 2;
          return {
            x: xCenter,
            min: d3.min(vals, d => d[key]),
            max: d3.max(vals, d => d[key]),
            avg: d3.mean(vals, d => d[key]),
            count: vals.length
          };
        })
        .filter(d => d !== null)
        .sort((a, b) => a.x - b.x);

      const envelopeCr = buildEnvelope(baseBins, 'ave_cr');
      const envelopeSocial = buildEnvelope(baseBins, 'ave_cr_social');
      const envelope = (selectedMetric === 'ave_cr' || showBoth) ? envelopeCr : envelopeSocial;

      const area = d3.area()
        .x(d => xScale(d.x))
        .y0(d => yScale(d.min))
        .y1(d => yScale(d.max))
        .curve(d3.curveCatmullRom.alpha(0.01));

      g.append('path')
        .datum(envelope)
        .attr('fill', yDataKey === 'ave_cr_social' ? '#86525E' : '#85908D')
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
        .attr('stroke', yDataKey === 'ave_cr_social' ? '#86525E' : '#85908D')
        .attr('stroke-width', 1)
        .attr('stroke-linecap', 'round')
        .attr('d', lineMax);    

      // Add min line
      const lineMin = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.min))
        .curve(d3.curveCatmullRom.alpha(0.01));

      g.append('path')
        .datum(envelope)
        .attr('fill', 'none')
        .attr('stroke', yDataKey === 'ave_cr_social' ? '#86525E' : '#85908D')
        .attr('stroke-width', 1)
        .attr('stroke-linecap', 'round')
        .attr('d', lineMin);


      // Draw average line as segmented lines with thickness proportional to bin count
      // To make thickness changes smoother, compute a short-window smoothed count per envelope point
      const counts = envelope.map(d => d.count || 0);
      const smoothed = counts.map((c, i) => {
        const prev = counts[i - 1] || 0;
        const next = counts[i + 1] || 0;
        return (prev + c + next) / 10; // simple 3-point moving average
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
          .attr('stroke', yDataKey === 'ave_cr_social' ? '#86525E' : '#85908D')
          .attr('stroke-width', thickness)
          .attr('stroke-linecap', 'round')
          .attr('opacity', 0.95);
      }

      // Add legend
      const legend = svg.append('g')
        .attr('transform', `translate(${margin.left + 20}, ${margin.top + 20})`);

      // If showBoth is enabled, compute and draw the alternate metric (social) overlays
      if (showBoth) {
        const overallColor = '#85908D';
        const socialColor = '#86525E';

        const yKeyPrimary = selectedMetric === 'ave_cr' ? 'ave_cr' : 'ave_cr_social';
        const yKeyOther = yKeyPrimary === 'ave_cr' ? 'ave_cr_social' : 'ave_cr';

        // regressions and per-metric datasets were computed earlier (regOther, dataCr, dataSocial)

        // Build envelope for the other metric using the same base bins
        const envelopeOther = envelopeSocial;

        const areaOther = d3.area()
          .x(d => xScale(d.x))
          .y0(d => yScale(d.min))
          .y1(d => yScale(d.max))
          .curve(d3.curveCatmullRom.alpha(0.01));

        g.append('path')
          .datum(envelopeOther)
          .attr('fill', yKeyOther === 'ave_cr_social' ? overallColor : socialColor)
          .attr('fill-opacity', 0.18)
          .attr('stroke', 'none')
          .attr('d', areaOther);

        // max and min lines for other
        const lineMaxOther = d3.line()
          .x(d => xScale(d.x))
          .y(d => yScale(d.max))
          .curve(d3.curveCatmullRom.alpha(0.02));

        g.append('path')
          .datum(envelopeOther)
          .attr('fill', 'none')
          .attr('stroke', yKeyOther === 'ave_cr_social' ? overallColor : socialColor)
          .attr('stroke-width', 1)
          .attr('stroke-linecap', 'round')
          .attr('d', lineMaxOther);

        const lineMinOther = d3.line()
          .x(d => xScale(d.x))
          .y(d => yScale(d.min))
          .curve(d3.curveCatmullRom.alpha(0.01));

        g.append('path')
          .datum(envelopeOther)
          .attr('fill', 'none')
          .attr('stroke', yKeyOther === 'ave_cr_social' ? overallColor : socialColor)
          .attr('stroke-width', 1)
          .attr('stroke-linecap', 'round')
          .attr('d', lineMinOther);

        // segmented trend line for other series (smoothed thickness).
        const countsOther = envelopeOther.map(d => d.count || 0);
        const smoothedOther = countsOther.map((c, i) => {
          const prev = countsOther[i - 1] || 0;
          const next = countsOther[i + 1] || 0;
          return (prev + c + next) / 10;
        });
        const maxSmoothedOther = d3.max(smoothedOther) || 1;

        for (let i = 0; i < envelopeOther.length - 1; i++) {
          const d = envelopeOther[i];
          const nextD = envelopeOther[i + 1];
          const avgSm = (smoothedOther[i] + smoothedOther[i + 1]) / 2;
          const thickness = 2 + (avgSm / maxSmoothedOther) * 8;

          g.append('line')
            .attr('x1', xScale(d.x))
            .attr('y1', yScale(d.x * regOther.slope + regOther.intercept))
            .attr('x2', xScale(nextD.x))
            .attr('y2', yScale(nextD.x * regOther.slope + regOther.intercept))
            .attr('stroke', yKeyOther === 'ave_cr_social' ? overallColor : socialColor)
            .attr('stroke-width', thickness)
            .attr('stroke-linecap', 'round')
            .attr('opacity', 0.9);
        }

        // augment legend: add color swatches for both series
        legend.append('rect')
          .attr('x', 0)
          .attr('y', 10)
          .attr('width', 12)
          .attr('height', 8)
          .attr('fill', overallColor);
        legend.append('text')
          .attr('x', 18)
          .attr('y', 18)
          .attr('font-size', '11px')
          .text('Creativity (Overall)');

        legend.append('rect')
          .attr('x', 0)
          .attr('y', 30)
          .attr('width', 12)
          .attr('height', 8)
          .attr('fill', socialColor);
        legend.append('text')
          .attr('x', 18)
          .attr('y', 38)
          .attr('font-size', '11px')
          .text('Creativity (Social)');
      }

    };
    loadData().catch(err => console.error('Failed to load data for ScatterPlot:', err));
  }, [selectedMetric, studentRows]);

  return (
    <div style={{ maxWidth: '50%', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div>
        <div style={{ textAlign: 'center' }}>
          <label style={{ marginRight: '10px', fontSize: '16px', fontWeight: 'bold' }}>
            Empathy on
          </label>
          <select 
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            style={{
              fontSize: '1rem',
              cursor: 'pointer', 
              fontFamily: 'inherit',
              fontWeight: 'bold',
              padding: '6px 20px',
              borderRadius: '20px',

            }}
          >
            <option value="both">Both Metrics</option>
            <option value="ave_cr">Creativity (Overall)</option>
            <option value="ave_cr_social">Creativity (Social Problem Solving)</option>
            
          </select>
          
        </div>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}