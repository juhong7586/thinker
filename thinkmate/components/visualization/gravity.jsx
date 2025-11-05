import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function GravityScatterPlot() {
  const svgRef = useRef();

  useEffect(() => {
    d3.csv('/data/kr_students.csv').then(csv => {
      csv.forEach(function(d) {
        d.ave_emp = +d.ave_emp;
      });

      const rawData = csv.filter(item => !isNaN(item.ave_emp));

      const width = 700;
      const height = 700;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(width, height) / 2 - 40;

      // Clear previous content
      d3.select(svgRef.current).selectAll("*").remove();

      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height);

      // Add concentric circles (universe rings)
      const circles = [0, 1, 2, 3, 4, 5];
      svg.selectAll('.ring')
        .data(circles)
        .enter()
        .append('circle')
        .attr('class', 'ring')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', d => (d / 5) * maxRadius)
        .attr('fill', 'none')
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5);

      // Add ring labels
      svg.selectAll('.ring-label')
        .data(circles)
        .enter()
        .append('text')
        .attr('class', 'ring-label')
        .attr('x', centerX + 10)
        .attr('y', d => centerY - (d / 5) * maxRadius)
        .attr('font-size', '12px')
        .attr('fill', '#999')
        .text(d => 5-d);

      // Position data points using force simulation
      const data = rawData.map(d => ({
        value: d.ave_emp,
        x: centerX,
        y: centerY
      }));

      // Assign random angles around the circle
      data.forEach((d, i) => {
        const angle = (Math.random() * Math.PI * 2);
        const radius = (d.value / 5) * maxRadius;
        d.x = centerX + Math.cos(angle) * radius;
        d.y = centerY + Math.sin(angle) * radius;
      });

      const simulation = d3.forceSimulation(data)
        .force('radial', d3.forceRadial(d => (d.value / 5) * maxRadius, centerX, centerY).strength(0.2))
        .force('collide', d3.forceCollide(3))
        .stop();

      for (let i = 0; i < 150; i++) simulation.tick();

      // Add scatter points (universe particles)
      svg.selectAll('.particle')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'particle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 4)
        .attr('fill', d => {
          // Color gradient based on empathy score
          const colorScale = d3.scaleLinear()
            .domain([0, 2.5, 5])
            .range(['#ff6b6b', '#ffd700', '#4ecdc4']);
          return colorScale(d.value);
        })
        .attr('opacity', 0.7)
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 7)
            .attr('opacity', 1);
          
          // Show tooltip
          svg.append('text')
            .attr('class', 'tooltip')
            .attr('x', d.x)
            .attr('y', d.y - 15)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', '#333')
            .attr('font-weight', 'bold')
            .text(d.value.toFixed(2));
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 4)
            .attr('opacity', 0.7);
          svg.selectAll('.tooltip').remove();
        });

      // Add title
      svg.append('text')
        .attr('x', centerX)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '22px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text('Empathy Universe');

      // Add center label
      svg.append('text')
        .attr('x', centerX)
        .attr('y', centerY + 8)
        .attr('text-anchor', 'middle')
        .attr('font-size', '13px')
        .attr('fill', '#999')
        .text('Social problem solving');

      // Add legend
      const legendData = [
        { label: 'High Empathy', color: '#ff6b6b' },
        { label: 'Medium Empathy', color: '#ffd700' },
        { label: 'Low Empathy', color: '#4ecdc4' }
      ];

      const legend = svg.append('g')
        .attr('transform', `translate(30, ${height - 100})`);

      legend.append('text')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text('Empathy Scale:');

      legendData.forEach((d, i) => {
        legend.append('circle')
          .attr('cx', 0)
          .attr('cy', 20 + i * 20)
          .attr('r', 4)
          .attr('fill', d.color);
        
        legend.append('text')
          .attr('x', 12)
          .attr('y', 24 + i * 20)
          .attr('font-size', '11px')
          .attr('fill', '#666')
          .text(d.label);
      });

    }).catch(err => {
      console.error('Failed to load CSV:', err);
    });

  }, []);

  return (
    <div style={{ width: '100%', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}