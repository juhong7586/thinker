import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function BeesSwarmPlot() {
  const svgRef = useRef();

  useEffect(() => {
    d3.csv('/data/kr_students.csv').then(csv => {
      csv.forEach(function(d) {
        d.ave_cr = +d.ave_cr;
        d.ave_cr_social = +d.ave_cr_social;
      });

      const rawData = csv;
      const data = rawData.filter(item => !isNaN(item.ave_cr) && !isNaN(item.ave_cr_social));
      
      // Prepare data with type labels
      const dataCr = data
        .map(d => ({ value: d.ave_cr, type: 'Overall' }));

      const datacrSocial = data
        .map(d => ({ value: d.ave_cr_social, type: 'Social' }));

      const allData = [...dataCr, ...datacrSocial];

      const margin = { top: 60, right: 100, bottom: 0, left: 150 };
      const width = 900 - margin.left - margin.right;
      const height = 350 - margin.top - margin.bottom;

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
      const xAxis = d3.axisBottom(xScale).tickSize(0).tickPadding(5);
      g.append('g')
        .attr('transform', `translate(0,150)`)
        .call(xAxis)
        // .append('text')
        // .attr('y', 40)
        // .attr('x', width / 2)
        // .attr('fill', 'black')
        // .attr('text-anchor', 'middle')
        // .attr('font-size', '14px')
        // .text('Creativity Score');



      // Add type labels on the left
      g.selectAll('.type-label')
        .data(['Overall', 'Social'])
        .enter()
        .append('text')
        .attr('x', -60)
        .attr('y', d => yScale(d) + yScale.bandwidth() / 2 + 4)
        .attr('text-anchor', 'end')
        .attr('font-size', '13px')
        .attr('font-weight', 'bold')
        .text(d => `${d}`);

      // Force simulation for jittering
      const simulation = d3.forceSimulation(allData)
        .force('x', d3.forceX(d => xScale(d.value)).strength(0.9))
        .force('y', d3.forceY(d => yScale(d.type) + yScale.bandwidth() / 2).strength(1))
        .force('collide', d3.forceCollide(2.5))
        .stop();

      // Run simulation
      for (let i = 0; i < 120; i++) simulation.tick();

      // Add circles (bees)
      g.selectAll('.dot')
        .data(allData)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 5)
        .attr('fill', d => d.type === 'Overall' ? '#8884d8' : '#FFD700')
        .attr('opacity', 0.6)
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 7)
            .attr('opacity', 1);
          
          // Show tooltip
          g.append('text')
            .attr('class', 'tooltip')
            .attr('x', d.x)
            .attr('y', d.y - 15)
            .attr('text-anchor', 'middle')
            .attr('font-size', '11px')
            .attr('fill', '#333')
            .attr('background', 'white')
            .text(d.value.toFixed(2));
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 4.5)
            .attr('opacity', 0.6);
          g.selectAll('.tooltip').remove();
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

      // Add legend
      const legend = svg.append('g')
        .attr('transform', `translate(${width + margin.left - 200}, ${margin.top})`);

      legend.append('circle')
        .attr('r', 4.5)
        .attr('fill', '#8884d8');
      legend.append('text')
        .attr('x', 12)
        .attr('y', 5)
        .attr('font-size', '12px')
        .text('Overall');

      legend.append('circle')
        .attr('r', 4.5)
        .attr('cy', 20)
        .attr('fill', '#FFD700');
      legend.append('text')
        .attr('x', 12)
        .attr('y', 25)
        .attr('font-size', '12px')
        .text('Social');

    }).catch(err => {
      console.error('Failed to load CSV:', err);
    });

  }, []);

  return (
    <div style={{ width: '100%', minHeight: '40vh', backgroundColor: '#ffffff', padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}