import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function CreativityScatter() {
  const svgRef = useRef();
  const [selectedMetric, setSelectedMetric] = useState('ave_cr');

  useEffect(() => {
    d3.csv('/data/kr_students.csv').then(csv => {
      csv.forEach(function(d) {
        d.empathy_score = +d.empathy_score;
        d.country = d.country;
        d.ave_emp = +d.ave_emp;
        d.ave_cr = +d.ave_cr;
        d.ave_cr_social = +d.ave_cr_social;
      });

      const rawData = csv;
      let data, yLabel, yDomain, regression;

      if (selectedMetric === 'ave_cr') {
        data = rawData.filter(item => !isNaN(item.ave_cr) && !isNaN(item.ave_emp));
        yLabel = 'Creativity (Overall)';
        yDomain = [0, 2.2];
        // Use requested regression for overall creativity
        regression = { slope: 0.04, intercept: 1.12 };
      } else {
        data = rawData.filter(item => !isNaN(item.ave_cr_social) && !isNaN(item.ave_emp));
        yLabel = 'Creativity (Social Problem Solving)';
        yDomain = [0, 2.2];
        // Use requested regression for social problem solving
        regression = { slope: 0.11, intercept: 0.86 };
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

      // Add trend line
      const minX = 0;
      const maxX = 5;
      const trendLineData = [
        { x: minX, y: slope * minX + intercept },
        { x: maxX, y: slope * maxX + intercept }
      ];

      g.append('line')
        .attr('x1', xScale(trendLineData[0].x))
        .attr('y1', yScale(trendLineData[0].y))
        .attr('x2', xScale(trendLineData[1].x))
        .attr('y2', yScale(trendLineData[1].y))
        .attr('stroke', '#ff7300')
        .attr('stroke-width', 2)
        .attr('opacity', 0.8)
        .attr('stroke-dasharray', '5,5');

      // Add scatter points
      const yDataKey = selectedMetric === 'ave_cr' ? 'ave_cr' : 'ave_cr_social';
      
      g.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => xScale(d.ave_emp))
        .attr('cy', d => yScale(d[yDataKey]))
        .attr('r', 5)
        .attr('fill', '#8884d8')
        .attr('opacity', 0.7)
        .on('mouseover', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 8)
            .attr('opacity', 1);
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 5)
            .attr('opacity', 0.7);
        });

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

      legend.append('circle')
        .attr('r', 5)
        .attr('fill', '#8884d8');
      legend.append('text')
        .attr('x', 15)
        .attr('y', 5)
        .attr('font-size', '12px')
        .text('Students');

      legend.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 20)
        .attr('y2', 20)
        .attr('stroke', '#ff7300')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');
      legend.append('text')
        .attr('x', 25)
        .attr('y', 25)
        .attr('font-size', '12px')
        .text('Trend Line');

    }).catch(err => {
      console.error('Failed to load CSV for ScatterPlot:', err);
    });

  }, [selectedMetric]);

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