
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';


export default function LollipopChart({ currentCountry, countryData }) {
  const svgRef = useRef();
  useEffect(() => {
    const loadData = async () => {
      let csv = null;
      if (Array.isArray(countryData) && countryData.length) {
        csv = countryData;
      } else {
        console.error('No countryData available for LollipopChart');
        return;
      }

      const data = csv || [];

      const margin = { top: 30, right: 30, bottom: 60, left: 30 };
      const width = 1000 - margin.left - margin.right;
      const height = 500 - margin.top - margin.bottom;
   
      d3.select(svgRef.current).selectAll("*").remove();

      const svg = d3.select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      
      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Scales
      const xScale = d3.scaleBand()
        .range([0, width])
        .padding(0.5)
        .domain(data.map(d => d.country));

      const yScale = d3.scaleLinear()
        .domain([0, 0.24])
        .range([height, 0]);

      // Axes
      const xAxis = d3.axisBottom(xScale).tickSize(0);
      const yAxis = d3.axisLeft(yScale);


      // Render x axis and rotate tick labels for readability
      const xAxisG = g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);

      xAxisG.selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .attr('dx', '-0.6em')
        .attr('dy', '0.25em');

      // Axis label
      xAxisG.append('text')
        .attr('y', margin.bottom - 10)
        .attr('x', width / 2)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('font-size', '1.2rem')
        .text('Country');

      g.append('g')
        .call(yAxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.bottom)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('font-size', '1.2rem')
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
        .attr('y2', d => yScale(d.empathyScore))
        .attr('stroke', d => {
          if (d.country === currentCountry) return '#6C5838';
          else if (d.country === 'average') return '#9E8C6C';
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
        .attr('cy', d => yScale(d.empathyScore))
        .attr('r', 6)
        .attr('fill', d => {
          if (d.country === currentCountry) return '#6C5938';
          else if (d.country === 'average') return '#9E8C6C';
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
            .attr('y', yScale(d.empathyScore) - 20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '20px')
            .attr('fill', '#333')
            .text(d.empathyScore.toFixed(2));

          g.append('text')
            .attr('class', 'country-label')
            .attr('x', xScale(d.country) -20)
            .attr('y', yScale(d.empathyScore) + 30)
            .attr('font-size', '1rem')
            .attr('fill', '#333')
            .text(d.country);
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 6);
          g.selectAll('.tooltip, .country-label').remove();
        });

      
    
      // Add title
      svg.append('text')
        .attr('x', (width + margin.left + margin.right) / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text('Power of Empathy on Self-Directed Learning');
        
      };  
      loadData().catch(err => console.error('Failed to load data for LollipopChart:', err));
  }, [currentCountry]);
  return (
  <div style={{ width: '100%', padding: '20px', backgroundColor: '#ffffff', minHeight: '80vh' }}>
       <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px' }}>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}
