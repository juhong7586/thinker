
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';


export default function LollipopChart() {
  const svgRef = useRef();
  useEffect(() => {

    d3.csv('/data/empathy_by_country.csv').then(csv => {
      csv.forEach(function(d){ 
        d.empathy_score = +d.empathy_score; 
        d.country = d.country; 
      });
    const data = csv;

    const margin = { top: 30, right: 30, bottom: 100, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('style', 'background-color: white; border-radius: 8px;');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.country))
      .range([0, width])
      .padding(0.5);

    const yScale = d3.scaleLinear()
      .domain([0, 0.3])
      .range([height, 0]);

    // Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .append('text')
      .attr('y', 90)
      .attr('x', width / 2)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('Country');

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
      .text('Self-Directed Learning Index');

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat('')
      );

    // Add lines (stems)
    g.selectAll('.line')
      .data(data)
      .enter()
      .append('line')
      .attr('class', 'line')
      .attr('x1', d => xScale(d.country) + xScale.bandwidth() / 2)
      .attr('y1', height)
      .attr('x2', d => xScale(d.country) + xScale.bandwidth() / 2)
      .attr('y2', d => yScale(d.empathy_score))
      .attr('stroke', d => {
        if (d.country === 'Korea') return '#d32f2f';
        else if (d.country === 'OECD average') return '#000000';
        else return '#9e9e9e';
      })
      .attr('stroke-width', 3);

    // Add circles (lollipops)
    g.selectAll('.circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', d => xScale(d.country) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(d.empathy_score))
      .attr('r', 6)
      .attr('fill', d => {
        if (d.country === 'Korea') return '#d32f2f';
        else if (d.country === 'OECD average') return '#000000';
        else return '#9e9e9e';
      })
      
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 9);
        g.append('text')
          .attr('class', 'tooltip')
          .attr('x', xScale(d.country) + xScale.bandwidth() / 2)
          .attr('y', yScale(d.empathy_score) - 15)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('fill', '#333')
          .text(d.empathy_score.toFixed(2));
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 6);
        g.selectAll('.tooltip').remove();
      });

    // Rotate x-axis labels
    g.selectAll('.tick text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-5px')
      .attr('dy', '5px');

    // Add title
    svg.append('text')
      .attr('x', (width + margin.left + margin.right) / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text('Power of Empathy on Self-Directed Learning');
      }).catch(err => {
        console.error('Failed to load CSV for LollipopChart:', err);
      });

  }, []);

  return (
  <div style={{ width: '100%', padding: '20px', backgroundColor: '#f5f5f5', minHeight: '80vh' }}>
       <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}