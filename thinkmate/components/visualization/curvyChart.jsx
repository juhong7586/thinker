import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function CurvyChart() {
  const svgRef = useRef();


  useEffect(() => {
     d3.csv('/data/global_creativity.csv').then(csv => {
       csv.forEach(function(d) {
         // CSV has columns: country,overallScore,socialSuccess
         d.overallScore = d.overallScore === '' ? NaN : +d.overallScore;
         d.socialSuccess = d.socialSuccess === '' ? NaN : +d.socialSuccess;
         d.country = d.country && d.country.trim();
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

        // Sort by overall score (high to low) for positioning
        const data = [...allData].sort((a, b) => b.overallScore - a.overallScore);
            // Create a lookup for social scores sorted high to low
        const socialSorted = [...allData].sort((a, b) => b.socialSuccess - a.socialSuccess);
        const socialRank = {};
        socialSorted.forEach((d, i) => {
          socialRank[d.country] = i;
        });

        const margin = { top: 80, right: 60, bottom: 40, left: 80 };
        const barHeight = 8;
        const height = data.length * barHeight + margin.top + margin.bottom;
        const width = 800;
    
        d3.select(svgRef.current).selectAll("*").remove();
    
        const svg = d3.select(svgRef.current)
          .attr('width', width)
          .attr('height', height)
          .style('background', '#ffffff');



     // Draw connections and points — group each row so we can show labels on hover
    data.forEach((d, i) => {
      const y = i * barHeight;
      // Get the position on the right based on social ranking
      const socialY = socialRank[d.country] * barHeight;

      const row = g.append('g').attr('class', 'row').attr('data-country', d.country);
    })

}).catch(err => {
        console.error('Failed to load CSV for CurvyChart:', err);
      });

  }, []);

  return (
    <div style={{ width: '100%', padding: '20px',  minHeight: '80vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', padding: '15px', borderRadius: '4px' }}>
          <svg ref={svgRef}></svg>
        </div>

       
      </div>
    </div>
  );
}