import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function BeesSwarmPlot({ studentRows }) {
  const svgRef = useRef();

  useEffect(() => {
    const loadData = async () => {
      let rawData = null;
        if (Array.isArray(studentRows) && studentRows.length) {
          rawData = studentRows;
        } else {
          console.error('No studentRows data available for ScatterPlot');
          return;
        }

        const data = rawData.filter(item => !isNaN(item.ave_cr) && !isNaN(item.ave_cr_social));
        
        // Prepare data with type labels
        const dataCr = data
          .map(d => ({ value: d.ave_cr, type: 'Overall' }));

        const datacrSocial = data
          .map(d => ({ value: d.ave_cr_social, type: 'Social' }));

        const allData = [...dataCr, ...datacrSocial];

        const margin = { top: 60, right: 150, bottom: 0, left: 150 };
        const width = 1200 - margin.left - margin.right;
        const height = 600 - margin.top - margin.bottom;

        // Clear previous content
        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current)
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .attr('style', 'background-color: white; border-radius: 8px;');

        const g = svg.append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

        // Scale for x-axis (value)
        const xScale = d3.scaleLinear()
          .domain([0, 2])
          .range([0, width]);

        // Scale for y-axis (type)
        const yScale = d3.scaleBand()
          .domain(['Overall', 'Social'])
          .range([0, height])
          .padding(0.5);

        // Add x-axis
        const xAxis = d3.axisBottom(xScale).tickSize(17).tickPadding(5);
        g.append('g')
          .attr('transform', `translate(0,200)`)
          .call(xAxis);


        // Add type labels on the left
        g.selectAll('.type-label')
          .data(['Overall', 'Social Problem'])
          .enter()
          .append('text')
          .attr('x', -60)
          .attr('y', d => yScale(d) + 200)
          .attr('text-anchor', 'end')
          .attr('text-wrap', 'wrap')
          .attr('font-size', '1rem')
          .text(d => `${d}`);

        // Force simulation for jittering
        const simulation = d3.forceSimulation(allData)
          .force('x', d3.forceX(d => xScale(d.value)).strength(0.9))
          .force('y', d3.forceY(d => yScale(d.type)).strength(0.9))
          .force('collide', d3.forceCollide(5))
          .stop();

        // Run simulation
        for (let i = 0; i < 120; i++) simulation.tick();
        // Prepare counts for identical scores (student-level counts)
        const overallCounts = d3.rollup(data, v => v.length, d => d.ave_cr);
        const socialCounts = d3.rollup(data, v => v.length, d => d.ave_cr_social);
  const totalStudents = data.length || 0;

        // Tooltip group (reused)
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .style('display', 'none');


        // Guide line (vertical) and per-band tooltips
        const guideLine = g.append('line')
          .attr('class', 'hover-line')
          .attr('y1', height/4 -60)
          .attr('y2', height/4*3 -60)
          .attr('stroke', '#000')
          .attr('stroke-width', 1)
          .style('opacity', 0);

        const tooltipOverall = svg.append('g')
          .attr('class', 'tooltip-overall')
          .style('display', 'none');
        tooltipOverall.append('rect')
          .attr('width', 150)
          .attr('height', 28)
          .attr('rx', 6)
          .attr('fill', 'rgba(0,0,0,0.75)');
        const tooltipOverallText = tooltipOverall.append('text')
          .attr('x', 8)
          .attr('y', 18)
          .attr('fill', '#fff')
          .attr('font-size', '15px');

        const tooltipSocial = svg.append('g')
          .attr('class', 'tooltip-social')
          .style('display', 'none');
        tooltipSocial.append('rect')
          .attr('width', 150)
          .attr('height', 28)
          .attr('rx', 6)
          .attr('fill', 'rgba(0,0,0,0.75)');
        const tooltipSocialText = tooltipSocial.append('text')
          .attr('x', 8)
          .attr('y', 18)
          .attr('fill', '#fff')
          .attr('font-size', '15px');


        const tooltipScore = svg.append('g')
          .attr('class', 'tooltip-score')
          .style('display', 'none');
        tooltipScore.append('rect')
          .attr('width', 60)
          .attr('text-align', 'center')
          .attr('height', 28)
          .attr('rx', 6)
          .attr('fill', 'rgba(0,0,0,0.75)');
        const tooltipScoreText = tooltipScore.append('text')
          .attr('x', 8)
          .attr('y', 18)
          .attr('fill', '#fff')
          .attr('font-size', '15px');

        // Add circles (bees)
        g.selectAll('.dot')
          .data(allData)
          .enter()
          .append('circle')
          .attr('class', 'dot')
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
          .attr('r', 5)
          .attr('fill', d => d.type === 'Overall' ? '#86525E' : '#85908D')
          .attr('opacity', 0.6)
          .on('mouseover', function(event, d) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('r', 7)
              .attr('opacity', 1);


              // lookup count depending on type
              const count = d.type === 'Overall' ? (overallCounts.get(d.value) || 0) : (socialCounts.get(d.value) || 0);
              const label = ` student${count === 1 ? '' : 's'} • `;

              // position tooltip near the point (transform relative to svg)
              const xPos = xScale(d.value);
              const absX = margin.left + xPos;
              const overallCenter = margin.top + yScale('Overall') + yScale.bandwidth() / 2;
              const socialCenter = margin.top + yScale('Social') + yScale.bandwidth() / 2;

              // show single tooltip near hovered point (existing) for quick info
              tooltip.attr('transform', `translate(${absX}, ${margin.top + d.y - 36})`).style('display', null);

              // show guide line at x (within g coordinates)
              guideLine.attr('x1', xPos).attr('x2', xPos).transition().duration(80).style('opacity', 1);

              // show per-band tooltips with counts for the same score
              const overallCount = overallCounts.get(d.value) || 0;
              const socialCount = socialCounts.get(d.value) || 0;
              const padNum = (n) => String(n);
              const pct = (count) => totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
              const padPct = (p) => String(Math.round(p));

              tooltipOverallText.text(`${padNum(overallCount)} students (${padPct(pct(overallCount))}%)`);
              tooltipScoreText.text(`${d.value.toFixed(2)}`);
              tooltipSocialText.text(`${padNum(socialCount)} students (${padPct(pct(socialCount))}%)`);

              // position these tooltips centered on the vertical line, above each band
              const tWidth = 120;
              tooltipOverall.attr('transform', `translate(${absX - tWidth/2}, ${overallCenter - 110})`).style('display', null);
              tooltipScore.attr('transform', `translate(${absX - tWidth/2+28}, ${overallCenter})`).style('display', null);
              tooltipSocial.attr('transform', `translate(${absX - tWidth/2}, ${socialCenter + 36})`).style('display', null);

          
          })
          .on('mouseout', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('r', 5)
              .attr('opacity', 0.6);
            tooltip.style('display', 'none');
            // hide guide line and per-band tooltips
            guideLine.transition().duration(80).style('opacity', 0);
            tooltipOverall.style('display', 'none');
            tooltipScore.style('display', 'none');
            tooltipSocial.style('display', 'none');
          });

        // Add title
        svg.append('text')
          .attr('x', (width + margin.left + margin.right) / 2)
          .attr('y', 30)
          .attr('text-anchor', 'middle')
          .attr('font-size', '20px')
          .attr('font-weight', 'bold')
          .attr('fill', '#333')
          .text('Creativity Distribution Comparison');


      };
    loadData().catch(err =>  console.error('Failed to load data for Creativity Scatter Plot:', err));

  }, [studentRows]);

  return (
    <div style={{ width: '100%', minHeight: '40vh', backgroundColor: '#ffffff', padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px' }}>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}