import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function SlopeChart() {
  const svgRef = useRef();

  // Overall creative thinking scores
  const creativeTscores = {
    'Singapore': 41, 'Korea': 38, 'Canada': 38, 'Australia': 37, 'New Zealand': 36,
    'Estonia': 36, 'Finland': 36, 'Denmark': 35, 'Latvia': 35, 'Belgium': 35,
    'Poland': 34, 'Portugal': 34, 'Lithuania': 33, 'Spain': 33, 'Czechia': 33,
    'Germany': 33, 'France': 32, 'Netherlands': 32, 'Israel': 32, 'Italy': 31,
    'Malta': 31, 'Hungary': 31, 'Chile': 31, 'Croatia': 30, 'Iceland': 30,
    'Slovenia': 30, 'Slovak Republic': 29, 'Mexico': 29, 'Serbia': 29, 'Uruguay': 29,
    'United Arab Emirates': 28, 'Qatar': 28, 'Costa Rica': 27, 'Greece': 27,
    'Romania': 26, 'Colombia': 26, 'Jamaica': 26, 'Malaysia': 25, 'Mongolia': 25,
    'Moldova': 24, 'Kazakhstan': 24, 'Brunei Darussalam': 24, 'Peru': 23, 'Brazil': 23,
    'Saudi Arabia': 23, 'Panama': 23, 'El Salvador': 23, 'Thailand': 21, 'Bulgaria': 21,
    'Jordan': 20, 'North Macedonia': 19, 'Indonesia': 19, 'Dominican Republic': 15,
    'Morocco': 15, 'Uzbekistan': 14, 'Philippines': 14, 'Albania': 13,
    'Chinese Taipei': 33, 'Macao (China)': 32, 'Hong Kong (China)': 32,
    'Ukrainian regions': 27, 'Cyprus': 24, 'Baku (Azerbaijan)': 23, 'Palestinian Authority': 18
  };

  // Social problem solving relative success
  const socialProbData = {
    'Australia': -2.3, 'Belgium': -0.5, 'Canada': -1.0, 'Chile': -5.8, 'Colombia': -8.3,
    'Costa Rica': 5.3, 'Czechia': -4.1, 'Denmark': -3.7, 'Estonia': -0.4, 'Finland': 2.4,
    'France': 1.0, 'Germany': 0.7, 'Greece': 2.2, 'Hungary': -1.0, 'Iceland': -9.6,
    'Israel': -0.1, 'Italy': -3.3, 'Korea': -3.8, 'Latvia': 1.6, 'Lithuania': -0.6,
    'Mexico': -6.5, 'Netherlands': -1.7, 'New Zealand': -1.4, 'Poland': 1.3, 'Portugal': -0.2,
    'Slovak Republic': -1.8, 'Slovenia': -1.8, 'Spain': -2.3,
    'Albania': -13.0, 'Baku (Azerbaijan)': -0.8, 'Brazil': 1.9, 'Brunei Darussalam': -2.6,
    'Bulgaria': -3.5, 'Croatia': -3.1, 'Cyprus': 5.5, 'Dominican Republic': -12.9,
    'El Salvador': 0.4, 'Hong Kong (China)': -3.0, 'Indonesia': -2.5, 'Jamaica': -0.1,
    'Jordan': -1.3, 'Kazakhstan': 3.5, 'Macao (China)': -2.8, 'Malaysia': 7.0, 'Malta': -3.2,
    'Moldova': -1.9, 'Mongolia': -5.8, 'Morocco': -7.8, 'North Macedonia': -7.1,
    'Palestinian Authority': -0.6, 'Panama': 3.9, 'Peru': 0.6, 'Philippines': -11.9,
    'Qatar': -0.3, 'Romania': -11.2, 'Saudi Arabia': -0.3, 'Serbia': -4.0, 'Singapore': 4.8,
    'Chinese Taipei': -0.3, 'Thailand': -3.9, 'Ukrainian regions': -5.6,
    'United Arab Emirates': -1.1, 'Uruguay': -3.9, 'Uzbekistan': -1.1
  };

  useEffect(() => {
    if (!svgRef.current) return;

    // Combine and sort data by overall score
    const data = Object.keys(creativeTscores)
      .map(country => ({
        country,
        overallScore: creativeTscores[country],
        socialSuccess: socialProbData[country] || 0,
        isKorea: country === 'Korea'
      }))
      .filter(d => d.socialSuccess !== 0)
      .sort((a, b) => b.overallScore - a.overallScore);

    const margin = { top: 50, right: 120, bottom: 40, left: 120 };
    const barHeight = 20;
    const height = data.length * barHeight + margin.top + margin.bottom;
    const width = 1000;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background', '#f9f9f9');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxScore = 42;
    const xScale = d3.scaleLinear().domain([0, maxScore]).range([0, width - margin.left - margin.right]);
    const socialScale = d3.scaleLinear().domain([-15, 10]).range([0, width - margin.left - margin.right]);

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .text('Creative Performance Slope: Overall vs Social Problem Solving');

    // Left axis label
    svg.append('text')
      .attr('x', margin.left - 10)
      .attr('y', 35)
      .attr('text-anchor', 'end')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Overall Creative Thinking Score');

    // Right axis label
    svg.append('text')
      .attr('x', width - margin.right + 10)
      .attr('y', 35)
      .attr('text-anchor', 'start')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Social Problem Solving Success (%)');

    // Draw connections and points
    data.forEach((d, i) => {
      const y = i * barHeight;
      const leftX = xScale(d.overallScore);
      const rightX = socialScale(d.socialSuccess);

      // Connecting line
      g.append('line')
        .attr('x1', 0)
        .attr('y1', y + barHeight / 2)
        .attr('x2', width - margin.left - margin.right)
        .attr('y2', y + barHeight / 2)
        .attr('stroke', d.isKorea ? '#d73027' : '#ccc')
        .attr('stroke-width', d.isKorea ? 2 : 0.5)
        .attr('opacity', d.isKorea ? 1 : 0.5);

      // Left point (overall score)
      g.append('circle')
        .attr('cx', 0)
        .attr('cy', y + barHeight / 2)
        .attr('r', d.isKorea ? 6 : 4)
        .attr('fill', '#4575b4')
        .attr('opacity', d.isKorea ? 1 : 0.7);

      // Right point (social problem solving)
      const pointColor = d.socialSuccess > 0 ? '#2ca02c' : '#d73027';
      g.append('circle')
        .attr('cx', width - margin.left - margin.right)
        .attr('cy', y + barHeight / 2)
        .attr('r', d.isKorea ? 6 : 4)
        .attr('fill', pointColor)
        .attr('opacity', d.isKorea ? 1 : 0.7);

      // Country label (left)
      g.append('text')
        .attr('x', -10)
        .attr('y', y + barHeight / 2 + 3)
        .attr('text-anchor', 'end')
        .attr('font-size', '11px')
        .attr('font-weight', d.isKorea ? 'bold' : 'normal')
        .attr('fill', d.isKorea ? '#d73027' : '#333')
        .text(d.country);

      // Overall score label
      g.append('text')
        .attr('x', 8)
        .attr('y', y + barHeight / 2 + 3)
        .attr('font-size', '10px')
        .attr('fill', '#333')
        .text(d.overallScore);

      // Social success label (right)
      g.append('text')
        .attr('x', width - margin.left - margin.right + 10)
        .attr('y', y + barHeight / 2 + 3)
        .attr('font-size', '10px')
        .attr('fill', '#333')
        .text(d.socialSuccess.toFixed(1) + '%');
    });

    // Legend
    const legendY = height - 30;
    
    svg.append('circle').attr('cx', margin.left + 20).attr('cy', legendY).attr('r', 4).attr('fill', '#4575b4');
    svg.append('text').attr('x', margin.left + 35).attr('y', legendY + 3).attr('font-size', '11px').text('Overall Creative Thinking');

    svg.append('circle').attr('cx', margin.left + 280).attr('cy', legendY).attr('r', 4).attr('fill', '#2ca02c');
    svg.append('text').attr('x', margin.left + 295).attr('y', legendY + 3).attr('font-size', '11px').text('Positive Social Problem Solving');

    svg.append('circle').attr('cx', margin.left + 580).attr('cy', legendY).attr('r', 4).attr('fill', '#d73027');
    svg.append('text').attr('x', margin.left + 595).attr('y', legendY + 3).attr('font-size', '11px').text('Negative Social Problem Solving (South Korea highlighted)');

  }, []);

  return (
    <div style={{ width: '100%', padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', backgroundColor: '#fafafa', padding: '15px', borderRadius: '4px' }}>
          <svg ref={svgRef}></svg>
        </div>

        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px', fontSize: '13px', color: '#666', lineHeight: '1.7' }}>
        
          
        </div>
      </div>
    </div>
  );
}