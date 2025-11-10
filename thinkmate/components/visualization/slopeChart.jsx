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

    const margin = { top: 80, right: 60, bottom: 10, left: 150 };
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
    // svg.append('text')
    //   .attr('x', width / 2)      
    //   .attr('y', 40)
    //   .attr('text-anchor', 'middle')
    //   .attr('font-size', '1.5rem')
    //   .attr('font-weight', 'bold')
    //   .attr('margin', '10px')
    //   .text('Overall vs Social Problem Solving')
    //   ;

    // Left axis label
    svg.append('text')
      .attr('x', margin.left-20)
      .attr('y', 65)
      .attr('text-anchor', 'start')
      .attr('font-size', '1.2rem')
      .attr('font-weight', 'normal')
      .text('Overall Creative Thinking Rank');

    // Right axis label
    svg.append('text')
      .attr('x', width - margin.right )
      .attr('y', 65)
      .attr('text-wrap', 'wrap')
      .attr('text-anchor', 'end')
      .attr('font-size', '1.2rem')
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

      // Attach data attributes so we can find rows sharing the same numeric values on hover
      const row = g.append('g')
        .attr('class', 'row')
        .attr('data-country', d.country)
        .attr('data-overall', String(d.overallScore))
        .attr('data-social', String(d.socialSuccess))
        .attr('data-iskorea', String(d.isKorea));

      // Connecting line
      row.append('line')
        .attr('x1', 0)
        .attr('y1', y + barHeight / 2)
        .attr('x2', width - margin.left - margin.right-20)
        .attr('y2', socialY + barHeight / 2)
        .attr('stroke', d.isKorea ? '#d73027' : '#ccc')
        .attr('stroke-width', d.isKorea ? 2 : 0.5)
        .attr('opacity', d.isKorea ? 1 : 0.5)
        .attr('class', 'connector')
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
        .attr('x', d.isKorea ? -10 : -10)
        .attr('y', d.isKorea? y+barHeight/2+3 : (y + socialY) / 2 + barHeight / 2 + 3)
        .attr('text-anchor', 'end')
        .attr('font-size', d.isKorea ? '1.2rem' : '0.8rem')
        .attr('font-weight', d.isKorea ? 'bold' : 'normal')
        .attr('fill', d.isKorea ? '#d73027' : '#333')
        .attr('class', 'label-country')
        .attr('padding', '20px')
        .style('opacity', d.isKorea ? 1 : 0)
        .text(d.country);

      // Overall score label
      row.append('text')
        .attr('x', 5)
        .attr('y', y + barHeight / 2 + 3)
        .attr('font-size', d.isKorea ? '1.2rem' : '0.8rem')
        .style('opacity', d.isKorea ? 1 : 0)
        .attr('class', 'label-overall')
        .attr('fill', '#333')
        .text(d.overallScore);

      // Social success label (right) — hidden by default
      row.append('text')
        .attr('x', width - margin.left - margin.right + 5)
        .attr('y', socialY + barHeight / 2 + 3)
        .attr('font-size', d.isKorea ? '1.2rem' : '0.8rem')
        .attr('fill', '#333')
        .attr('class', 'label-social')
        .style('opacity', d.isKorea ? 1 : 0)
        .text(d.socialSuccess.toFixed(1) + '%');

      // Hover handlers: show labels for matching rows and stack them to avoid overlap
      row.on('mouseover', function() {
        const ov = String(d.overallScore);
        const soc = String(d.socialSuccess);
        const labelSpacing = 14; // px between stacked labels

        // find rows that match either overall OR social
        const matched = g.selectAll('.row').filter(function() {
          const ro = d3.select(this).attr('data-overall');
          return ro === ov;
        });

        // For rows grouped by the same overall value, stack their left labels vertically
        const groupsByOverall = {};
        matched.each(function() {
          const el = d3.select(this);
          const ro = el.attr('data-overall');
          if (!groupsByOverall[ro]) groupsByOverall[ro] = [];
          groupsByOverall[ro].push(this);
        });

        Object.keys(groupsByOverall).forEach(key => {
          const nodes = groupsByOverall[key];
          const n = nodes.length;
          // base y for this overall value
          const val = Number(key);
          const baseIdx = (creativityIndex[val] !== undefined) ? creativityIndex[val] : 0;
          const baseY = baseIdx * leftBarHeight + barHeight / 2 + 3;
          nodes.forEach((node, idx) => {
            const offset = (idx - (n - 1) / 2) * labelSpacing;
            d3.select(node).selectAll('.label-country')
              .transition().duration(120)
              .attr('y', baseY + offset)
              .style('opacity', 1);
            // also show the numeric labels for these rows
            d3.select(node).selectAll('.label-social, .label-overall')
              .transition().duration(120).style('opacity', 1);
            // highlight connector
            d3.select(node).selectAll('.connector')
              .transition().duration(120).style('opacity', 1).style('stroke', '#000');
          });
        });
      }).on('mouseout', function() {
        // restore labels to hidden (except Korea)
        g.selectAll('.row').selectAll('.label-country')
          .transition().duration(120)
          // reset y to the original base position for that row
          .attr('y', function() {
            const el = d3.select(this.parentNode);
            const ro = Number(el.attr('data-overall'));
            const baseIdx = (creativityIndex[ro] !== undefined) ? creativityIndex[ro] : 0;
            return baseIdx * leftBarHeight + barHeight / 2 + 3;
          })
          .style('opacity', 0);

        // hide numeric labels and reset connectors
        g.selectAll('.row').selectAll('.label-social, .label-overall')
          .transition().duration(120).style('opacity', 0);
        g.selectAll('.row').selectAll('.connector')
          .transition().duration(120).style('opacity', 0.5).style('stroke', '#ccc');

        // keep Korea labels visible
        g.selectAll('.row')
          .filter(function() { return d3.select(this).attr('data-iskorea') === 'true'; })
          .selectAll('.label-country, .label-social, .label-overall')
          .transition().duration(120).style('opacity', 1);
      });
    });

    // Legend
    const legendY = height - 30;
    
    svg.append('circle')
      .attr('cx', margin.left)
      .attr('cy', legendY)
      .attr('r', 4)
      .attr('fill', '#2ca02c');
    svg.append('text')
      .attr('x', margin.left + 15)
      .attr('y', legendY + 3)
      .attr('font-size', '15px')
      .text('Positive Social Problem Solving');

    svg.append('circle')
      .attr('cx', margin.left + 330)
      .attr('cy', legendY)
      .attr('r', 4)
      .attr('fill', '#d73027');
    svg.append('text')
      .attr('x', margin.left + 345)
      .attr('y', legendY + 3)
      .attr('font-size', '15px')
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