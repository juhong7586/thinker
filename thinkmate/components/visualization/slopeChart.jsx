import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function SlopeChart() {
  const svgRef = useRef();
  const uniqueSocial = new Set();
  const uniqueCreativity = new Set();

  useEffect(() => {
     d3.csv('/data/global_creativity.csv').then(csv => {
       csv.forEach(function(d) {
         // CSV has columns: country,overallScore,socialSuccess
         d.overallScore = d.overallScore === '' ? NaN : +d.overallScore;
         d.socialSuccess = d.socialSuccess === '' ? NaN : +d.socialSuccess;
         d.country = d.country && d.country.trim();
          if (!isNaN(d.socialSuccess)) uniqueSocial.add(d.socialSuccess);
          if (!isNaN(d.overallScore)) uniqueCreativity.add(d.overallScore);
       });

       const rawData = csv;
       const allData = rawData
         .filter(item => item.country && !isNaN(item.overallScore) && !isNaN(item.socialSuccess))
         .map(d => ({
           country: d.country,
           overallScore: d.overallScore,
           socialSuccess: d.socialSuccess,
           isKorea: d.country === 'Korea'
         }));

    // Keep data sorted by overall score for iteration (display order)
    const data = [...allData].sort((a, b) => b.overallScore - a.overallScore);

    // Build index maps from the unique value sets (sorted high -> low).
    // These maps let us place rows on discrete bands for each unique score value.
    const creativityValues = Array.from(uniqueCreativity).filter(v => !isNaN(v)).sort((a, b) => b - a);
    const creativityIndex = {};
    creativityValues.forEach((v, i) => { creativityIndex[v] = i; });

    const socialValues = Array.from(uniqueSocial).filter(v => !isNaN(v)).sort((a, b) => b - a);
    const socialIndex = {};
    socialValues.forEach((v, i) => { socialIndex[v] = i; });

    // Create a lookup for social index by country for convenience
    const socialRank = {};
    data.forEach(d => {
      socialRank[d.country] = socialIndex[d.socialSuccess];
    });

    const margin = { top: 80, right: 60, bottom: 40, left: 80 };
    const leftBarHeight = 18;  
    const barHeight = 8;
    const height = data.length * barHeight + margin.top + margin.bottom;
    const width = 800;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxScore = 42;
    const xScale = d3.scaleLinear().domain([0, maxScore]).range([0, width - margin.left - margin.right]);
    const socialScale = d3.scaleLinear().domain([-15, 10]).range([0, width - margin.left - margin.right]);

    // Title
    svg.append('text')
      .attr('x', width / 2)      
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '1.2rem')
      .attr('font-weight', 'bold')
      .text('Creative Performance Slope: Overall vs Social Problem Solving')
      ;

    // Left axis label
    svg.append('text')
      .attr('x', margin.left-20)
      .attr('y', 65)
      .attr('text-anchor', 'start')
      .attr('font-size', '0.8rem')
      .attr('font-weight', 'normal')
      .text('Overall Creative Thinking Rank');

    // Right axis label
    svg.append('text')
      .attr('x', width - margin.right )
      .attr('y', 65)
      .attr('text-wrap', 'wrap')
      .attr('text-anchor', 'end')
      .attr('font-size', '0.8rem')
      .attr('font-weight', 'normal')
      .text('Social Problem Solving Rank');

    // Draw connections and points — group each row so we can show labels on hover
    data.forEach((d) => {
      // Use the creativity index (based on unique creativity values) for left axis position
      const creativityIdx = (creativityIndex[d.overallScore] !== undefined) ? creativityIndex[d.overallScore] : 0;
      const y = creativityIdx * leftBarHeight;
      // Use the social index ( based on unique social values) for right axis position
      const socialIdx = (socialIndex[d.socialSuccess] !== undefined) ? socialIndex[d.socialSuccess] : 0;
      const socialY = socialIdx * barHeight;

      // // Get the position on the right based on social ranking (from socialRank built above)
      // const socialY = (socialRank[d.country] !== undefined) ? socialRank[d.country] * barHeight : 0;

      const row = g.append('g').attr('class', 'row').attr('data-country', d.country);

      // Connecting line
      row.append('line')
        .attr('x1', 0)
        .attr('y1', y + barHeight / 2)
        .attr('x2', width - margin.left - margin.right-20)
        .attr('y2', socialY + barHeight / 2)
        .attr('stroke', d.isKorea ? '#d73027' : '#ccc')
        .attr('stroke-width', d.isKorea ? 2 : 0.5)
        .attr('opacity', d.isKorea ? 1 : 0.5)
        .style('pointer-events', 'stroke');

      // Left point (overall score)
      row.append('circle')
        .attr('cx', 0)
        .attr('cy', y + barHeight / 2)
        .attr('r', d.isKorea ? 5 : 3)
        .attr('fill', '#4575b4')
        .attr('opacity', d.isKorea ? 1 : 0.7)
        .style('cursor', 'pointer');

      // Right point (social problem solving)
      const pointColor = d.socialSuccess > 0 ? '#2ca02c' : '#d73027';
      row.append('circle')
        .attr('cx', width - margin.left - margin.right-20)
        .attr('cy', socialY + barHeight / 2)
        .attr('r', d.isKorea ? 5 : 3)
        .attr('fill', pointColor)
        .attr('opacity', d.isKorea ? 1 : 0.7)
        .style('cursor', 'pointer');

      // Country label (left) — hidden by default
      row.append('text')
        .attr('x', -10)
        .attr('y', y + barHeight / 2 + 3)
        .attr('text-anchor', 'end')
        .attr('font-size', d.isKorea ? '1.2rem' : '0.8rem')
        .attr('font-weight', d.isKorea ? 'bold' : 'normal')
        .attr('fill', d.isKorea ? '#d73027' : '#333')
        .attr('class', 'label-country')
        .style('opacity', d.isKorea ? 1 : 0)
        .text(d.country);

      // Overall score label
      row.append('text')
        .attr('x', 5)
        .attr('y', y + barHeight / 2 + 3)
        .attr('font-size', '0.8rem')
        .style('opacity', d.isKorea ? 1 : 0)
        .attr('class', 'label-overall')
        .attr('fill', '#333')
        .text(d.overallScore);

      // Social success label (right) — hidden by default
      row.append('text')
        .attr('x', width - margin.left - margin.right + 5)
        .attr('y', socialY + barHeight / 2 + 3)
        .attr('font-size', '0.8rem')
        .attr('fill', '#333')
        .attr('class', 'label-social')
        .style('opacity', d.isKorea ? 1 : 0)
        .text(d.socialSuccess.toFixed(1) + '%');

      // Hover handlers: show labels on mouseover and hide on mouseout
      row.on('mouseover', function() {
        d3.select(this).selectAll('.label-country, .label-social, .label-overall')
          .transition().duration(120).style('opacity', 1);
      }).on('mouseout', function() {
        d3.select(this).selectAll('.label-country, .label-social, .label-overall')
          .transition().duration(120).style('opacity', 0);
        d.isKorea && d3.select(this).selectAll('.label-country, .label-social, .label-overall')
          .transition().duration(120).style('opacity', 1);
      });
    });

    // Legend
    const legendY = height - 30;
    
    svg.append('circle')
      .attr('cx', margin.left + 20)
      .attr('cy', legendY)
      .attr('r', 4)
      .attr('fill', '#4575b4');
    svg.append('text')
      .attr('x', margin.left + 35)
      .attr('y', legendY + 3)
      .attr('font-size', '11px')
      .text('Overall Creative Thinking');

    svg.append('circle')
      .attr('cx', margin.left + 250)
      .attr('cy', legendY)
      .attr('r', 4)
      .attr('fill', '#2ca02c');
    svg.append('text')
      .attr('x', margin.left + 265)
      .attr('y', legendY + 3)
      .attr('font-size', '11px')
      .text('Positive Social Problem Solving');

    svg.append('circle')
      .attr('cx', margin.left + 500)
      .attr('cy', legendY)
      .attr('r', 4)
      .attr('fill', '#d73027');
    svg.append('text')
      .attr('x', margin.left + 515)
      .attr('y', legendY + 3)
      .attr('font-size', '11px')
      .text('Negative Social Problem Solving');

  }).catch(err => {
        console.error('Failed to load CSV for SlopeChart:', err);
      });

  }, []);

  return (
    <div style={{ width: '100%', padding: '20px',  minHeight: '80vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', padding: '15px', borderRadius: '4px' }}>
          <svg ref={svgRef}></svg>
        </div>

       
      </div>
    </div>
  );
}