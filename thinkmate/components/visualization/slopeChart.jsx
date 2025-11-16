import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function SlopeChart({ currentCountry, countryData, colorScheme = 'RdYlGn', colorDomain = null}) {
  const svgRef = useRef();

  useEffect(() => {
    // recreate these per-draw so changes to currentCountry trigger a fresh render
    const uniqueSocial = new Set();
    const uniqueCreativity = new Set();

    const loadData = async () => {

    let csv = null;
    if (Array.isArray(countryData) && countryData.length) {
      csv = countryData;
    } else {
      console.error('No countryData available for LollipopChart');
      return;
    }
    
    let rawData = csv || [];
    
    // Keep data sorted by overall score for iteration (display order)
    const data = [...rawData].sort((a, b) => b.overallScore - a.overallScore);

    
    // Populate unique value sets from the incoming rows so indexes are meaningful
    rawData.forEach(r => {
      const ov = Number(r.overallScore ?? r.overall_score ?? r.overall);
      const sv = Number(r.socialSuccess ?? r.social_success ?? r.social);
      if (!isNaN(ov)) uniqueCreativity.add(ov);
      if (!isNaN(sv)) uniqueSocial.add(sv);

    });


    // These maps let us place rows on discrete bands for each unique score value.
    const creativityValues = Array.from(uniqueCreativity).filter(v => !isNaN(v)).sort((a, b) => b - a);
    const creativityIndex = {};
    creativityValues.forEach((v, i) => { creativityIndex[v] = i; });

    const socialValues = Array.from(uniqueSocial).filter(v => !isNaN(v)).sort((a, b) => b - a);
    const socialIndex = {};
    socialValues.forEach((v, i) => { socialIndex[v] = i; });

    // if explicit two-color endpoints provided, use a simple RGB interpolator
    const interpSocial = d3.interpolateRgb('#ddd', '#715356');
    const interpAll = d3.interpolateRgb('#ddd', '#374B47');
    const minSocial = colorDomain ? colorDomain[0] : d3.min(data, d => Number(d.socialSuccess));
    const maxSocial = colorDomain ? colorDomain[1] : d3.max(data, d => Number(d.socialSuccess));
    const colorScaleSocial = d3.scaleSequential().domain([minSocial, maxSocial]).interpolator(interpSocial);
    const minAll = colorDomain ? colorDomain[0] : d3.min(data, d => Number(d.overallScore));
    const maxAll = colorDomain ? colorDomain[1] : d3.max(data, d => Number(d.overallScore));
    const colorScaleAll = d3.scaleSequential().domain([minAll, maxAll]).interpolator(interpAll);

    // Create a lookup for social index by country for convenience
    const socialRank = {};
    data.forEach(d => {
      socialRank[d.country] = socialIndex[d.socialSuccess];
    });

    const margin = { top: 40, right: 50, bottom: 10, left: 220 };
 
    const barHeight = 11;
    const height = 600;
    const width = 1000;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Left axis label
    svg.append('text')
      .attr('x', margin.left-20)
      .attr('y',15)
      .attr('text-anchor', 'start')
      .attr('font-size', '1rem')
      .attr('font-weight', 'normal')
      .text('Overall Creative Thinking Rank');

    // Right axis label
    svg.append('text')
      .attr('x', width - margin.right )
      .attr('y', 15)
      .attr('text-wrap', 'wrap')
      .attr('text-anchor', 'end')
      .attr('font-size', '1rem')
      .attr('font-weight', 'normal')
      .text('Social Problem Solving Rank');

 
    // Create a vertical legend of discrete circles for the full social range
    const legendX = width -  margin.right - 20;
    const legendHeight = height*0.7;
    const legendTop = margin.top;
    const legendScaleSocial = d3.scaleLinear().domain([minSocial, maxSocial]).range([legendTop + legendHeight, legendTop]);
    const legendScaleAll = d3.scaleLinear().domain([minAll, maxAll]).range([legendTop + legendHeight, legendTop]);
    const stepSocial = 0.1;
    const stepAll = 1;
    const ticksSocial = d3.range(minSocial, maxSocial + stepSocial / 2, stepSocial);
    const ticksAll = d3.range(minAll, maxAll + stepAll / 2, stepAll);
  

    const bands = Math.max(1, (creativityValues && creativityValues.length) || 1);
    const leftBarHeight = Math.max(20, legendHeight / bands);

    const legendGroupAll = svg.append('g').attr('class', 'legend-group');
    legendGroupAll.selectAll('.legend-circle-all')
      .data(ticksAll)
      .enter()
      .append('circle')
      .attr('class', 'legend-circle')
      .attr('cx', margin.left)
      .attr('cy', v => legendScaleAll(v))
      .attr('r', 6)
      .attr('stroke', 'none')
      .attr('opacity', 0.1)
      .attr('data-value', v => v)
      .attr('fill', v => colorScaleAll(v));

    // Hover handlers on the left legend circles: highlight rows with the same overall score
    legendGroupAll.selectAll('.legend-circle')
      .on('mouseover', function(event, v) {
        const ov = String(v);
        const labelSpacing = 14;

        // find rows that match this overall value
        const matched = g.selectAll('.row').filter(function() {
          const ro = d3.select(this).attr('data-overall');
          return ro === ov;
        });

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
          const val = Number(key);
          const baseIdx = (creativityIndex[val] !== undefined) ? creativityIndex[val] : 0;
          const baseY = baseIdx * leftBarHeight;
          nodes.forEach((node, idx) => {
            const offset = (idx - (n - 1) / 2) * labelSpacing;
            d3.select(node).selectAll('.label-country')
              .transition().duration(120)
              .attr('y', baseY + offset)
              .style('opacity', 1);
            d3.select(node).selectAll('.label-social, .label-overall')
              .transition().duration(120).style('opacity', 1);
            d3.select(node).selectAll('.connector')
              .transition().duration(120).style('opacity', 1).style('stroke', '#000');
          });
        });
      })
      .on('mouseout', function() {
        // restore labels to hidden (except current country)
        g.selectAll('.row').selectAll('.label-country')
          .transition().duration(120)
          .attr('y', function() {
            const el = d3.select(this.parentNode);
            const ro = Number(el.attr('data-overall'));
            const baseIdx = (creativityIndex[ro] !== undefined) ? creativityIndex[ro] : 0;
            return baseIdx * leftBarHeight + barHeight / 2 + 3;
          })
          .style('opacity', 0);

        g.selectAll('.row').selectAll('.label-social, .label-overall')
          .transition().duration(120).style('opacity', 0);
        g.selectAll('.row').selectAll('.connector')
          .transition().duration(120).style('opacity', 0.5).style('stroke', '#ccc');

        g.selectAll('.row')
          .filter(function() { return d3.select(this).attr('data-isCountry') === 'true'; })
          .selectAll('.label-country, .label-social, .label-overall')
          .transition().duration(120).style('opacity', 1);
      });

    const legendGroupSocial = svg.append('g').attr('class', 'legend-group');
    legendGroupSocial.selectAll('.legend-circle-social')
      .data(ticksSocial.map(v => Math.round(v * 10) / 10))
      .enter()
      .append('circle')
      .attr('class', 'legend-circle')
      .attr('cx', legendX)
      .attr('cy', v => legendScaleSocial(v))
      .attr('r', 6)
      .attr('stroke', 'none')
      .attr('opacity', 0.1)
      .attr('data-value', v => v)
      .attr('fill', v => colorScaleSocial(v));
    
   
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
        .attr('data-isCountry', String(d.isCountry));

      // Right point (social problem solving): reuse a matching legend circle instead of appending
      const roundedSocial = Math.round(Number(d.socialSuccess) * 10) / 10;
      const selectorSocial = `.legend-circle[data-value='${roundedSocial}']`;
      const selectorAll = `.legend-circle[data-value='${d.overallScore}']`;
      const matchSocial = svg.selectAll(selectorSocial);
      const matchAll = svg.selectAll(selectorAll);
      if (!matchSocial.empty()) {
        // highlight the existing legend circle for this row
        matchSocial
          .attr('opacity', d.country === currentCountry ? 1 : 0.9)
          .attr('r', d.country === currentCountry ? 10 : 6)
          .attr('fill', d.country === currentCountry ? '#8E424B' : matchSocial.attr('fill'))
          .attr('data-country', d.country);
        // bring any matched legend circles to the top so currentCountry markers are visible
        if (d.country === currentCountry) matchSocial.raise();
      } 
        // fallback: if no legend circle exists for this exact rounded value, append a small marker
      // fallback: append a small marker on the right. keep a reference so we can raise it.
      const fallbackSocial = row.append('circle')
        .attr('cx', width - margin.left - margin.right - 20)
        .attr('cy', legendScaleSocial(roundedSocial)- margin.top)
        .attr('r', d.country === currentCountry ? 10 : 6)
        .attr('fill', '#8E424B')
        .attr('opacity', d.country === currentCountry ? 1 : 0)
        .attr('data-country', d.country)
        .style('cursor','pointer');

      // ensure fallback marker for current country is on top
      if (d.country === currentCountry) fallbackSocial.raise();
  
      if (!matchAll.empty()) {
        // highlight the existing legend circle for this row
        matchAll
          .attr('opacity', d.country === currentCountry ? 1 : 0.9)
          .attr('r', d.country === currentCountry ? 10 : 6)
          .attr('fill', d.country === currentCountry ? '#2B5255' : matchAll.attr('fill'))
          .attr('data-country', d.country);
        // ensure overall-legend circle for current country is on top
        if (d.country === currentCountry) matchAll.raise();
      } 
        // fallback: if no legend circle exists for this exact value, append a small marker
        row.append('circle')
          .attr('cx', 0)
          .attr('cy', legendScaleAll(d.overallScore) - margin.top)
          .attr('r', d.country === currentCountry ? 10 : 6)
          .attr('fill', '#2B5255')
          .attr('opacity', 1)
          .style('cursor', 'pointer');
      

      // Connecting line
      row.append('line')
        .attr('x1', 0)
        // legendGroupAll uses absolute SVG coords `90 + legendScaleAll(v)*0.68`.
        // Convert that to g-local coords by subtracting margin.top so the connector aligns.
        .attr('y1', !isNaN(d.overallScore) ? legendScaleAll(d.overallScore) - margin.top: y + leftBarHeight / 2)
        .attr('x2', width - margin.left - margin.right - 20)
        // legendScale returns an absolute SVG y (includes margin.top).
        // Our row is inside `g` which is translated by margin.top, so subtract margin.top to get g-local y.
        .attr('y2', !isNaN(roundedSocial) ? legendScaleSocial(roundedSocial) - margin.top : socialY + barHeight / 2)
        .attr('stroke',d.country === currentCountry ? '#8E424B' : '#ccc')
        .attr('stroke-width', d.country === currentCountry ? 3 : 0.5)
        .attr('opacity', d.country === currentCountry ? 1 : 0.5)
        .attr('class', 'connector')
        .style('pointer-events', 'stroke');


      // Country label (left) — hidden by default
      row.append('text')
        .attr('x',d.country === currentCountry ? -15: -10)
        // always align left country labels to the left-axis baseline (avoid mixing left/right coords)
        .attr('y', d.country === currentCountry ? (legendScaleAll(d.overallScore) - margin.top): y + leftBarHeight / 2)
        .attr('text-anchor', 'end')
        .attr('font-size', d.country === currentCountry ? '1rem' : '0.8rem')
        .attr('font-weight', d.country === currentCountry ? 'bold' : 'normal')
        .attr('fill', d.country === currentCountry ? '#8E424B' : '#333')
        .attr('class', 'label-country')
        .style('opacity', d.country === currentCountry ? 1 : 0)
        .text(d.country);

      // Overall score label
      row.append('text')
        .attr('x', d.country === currentCountry ? 15: 5)
        .attr('y', (legendScaleAll(d.overallScore))- margin.top)
        .attr('font-size', d.country === currentCountry ? '1rem' : '1rem')
        .style('opacity', d.country === currentCountry ? 1 : 0)
        .attr('class', 'label-overall')
        .attr('fill', '#333')
        .text(d.overallScore);

      // Social success label (right) — hidden by default
      row.append('text')
        .attr('x', width - margin.left - margin.right)
        .attr('y', !isNaN(roundedSocial) ? (legendScaleSocial(roundedSocial) - margin.top + 7) : (socialY + barHeight / 2))
        .attr('font-size', d.country === currentCountry ? '1.1rem' : '1rem')
        .attr('fill', '#333')
        .attr('class', 'label-social')
        .style('opacity', d.country === currentCountry ? 1 : 0)
        .text(d.socialSuccess.toFixed(1) + '%');

      // Hover handlers: show labels for matching rows and stack them to avoid overlap
      row.on('mouseover', function() {
        const ov = String(d.overallScore);
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
          // Position labels vertically centered next to the left-side circle for that overall value
          const baseY = baseIdx * leftBarHeight + leftBarHeight / 2;
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
        // restore labels to hidden (except current country)
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

        // keep current country labels visible
        g.selectAll('.row')
          .filter(function() { return d3.select(this).attr('data-isCountry') === 'true'; })
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


    };
    loadData().catch(err => console.error('Failed to load data for SlopeChart:', err));

  }, [currentCountry, countryData]);

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