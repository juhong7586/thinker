import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function GravityScatterPlot({ currentCountry, studentRows }) {
  const svgRef = useRef();

  useEffect(() => {
    let cleanupFn = null;
    const loadData = async () => {
    // If there's no studentRows yet (no country selected), clear any SVG and exit quietly.
    if (!Array.isArray(studentRows) || studentRows.length === 0) {
      try {
        d3.select(svgRef.current).selectAll('*').remove();
      } catch (e) {
        // ignore during quick unmounts
      }
      return;
    }

    let rawData = studentRows;
    rawData = rawData.filter(item => !isNaN(item.ave_emp));

      const width = 1200;
      const height = 600;
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
        .attr('opacity', 0.1);

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
        .attr('opacity', 0)
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
        .force('radial', d3.forceRadial(d => (d.value / 5) * maxRadius, centerX, centerY).strength(0.7))
        .force('collide', d3.forceCollide(1))
        .stop();

      for (let i = 0; i < 150; i++) simulation.tick();

      // store base positions after the force simulation
      data.forEach(d => {
        d.baseX = d.x;
        d.baseY = d.y;
      });

      // Continuous color scale: white at center (low values) → black at outer (high values)
      const colorScale = d3.scaleLinear()
        .domain([0, 5])
        .range(['#f5e2be', '#2E2E2E']);

      // Add scatter points (universe particles)
      // We'll support different entrance directions and a scale/fade-in effect.
      // Start positions: support fixed directions or a 'random' mode where each
      // particle starts far outside the scene at a random angle and large radius.
      const startDir = 'random'; // options: 'bottom' | 'top' | 'left' | 'right' | 'center' | 'random'
      const startOffset = maxRadius * 1.6;

      const getStartPos = (d) => {
        if (startDir === 'random') {
          // pick a random angle and a radius outside the scene
          const angle = Math.random() * Math.PI * 2;
          // radius between startOffset and startOffset * 2 to vary distances
          const radius = startOffset + Math.random() * startOffset;
          return { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius };
        }
        switch (startDir) {
          case 'top':
            return { x: d.x, y: centerY - startOffset };
          case 'left':
            return { x: centerX - startOffset, y: d.y };
          case 'right':
            return { x: centerX + startOffset, y: d.y };
          case 'center':
            return { x: centerX, y: centerY };
          case 'bottom':
          default:
            return { x: centerX + startOffset, y: centerY + startOffset };
        }
      };

      // Append particles at their start positions with small radius and zero opacity for scale/fade-in
      svg.selectAll('.particle')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'particle')
        .attr('cx', d => getStartPos(d).x)
        .attr('cy', d => getStartPos(d).y)
        .attr('r', 0.5)
        .attr('fill', d => colorScale(d.value))
        .attr('opacity', 0)
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(100)
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

      // Animation: animate particles from start positions to their computed (d.x,d.y)
      const animateParticles = (reset = false) => {
        const sel = svg.selectAll('.particle');
        if (reset) {
          // Reset to start positions, tiny radius and invisible
          sel
            .attr('cx', d => getStartPos(d).x)
            .attr('cy', d => getStartPos(d).y)
            .attr('r', 0.5)
            .attr('opacity', 0);
        }

        sel.transition()
          .duration(100)
          .delay((d, i) => i * 6)
          .ease(d3.easeCubicOut)
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
          .attr('r', 4)
          .attr('opacity', 0.95);
      };

      // IntersectionObserver to trigger animation when the svg is scrolled into view and replay on re-entry
      let obs = null;
      if (typeof IntersectionObserver !== 'undefined') {
        obs = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Reset and animate so the effect replays on each entry
              animateParticles(true);
            }
          });
        }, { threshold: 0.25 });
        obs.observe(svgRef.current);
      } else {
        // Fallback: run immediately
        animateParticles(true);
      }

      // Scroll-driven animation phases:
      // 1) gathering: initial entrance animation (particles move to their computed positions)
      // 2) converging: when scrolled a little, particles move to bottom-center
      // 3) spreading: when scrolled further, particles spread across the scene
      let phase = 'gathering';
      let gathered = false;

      // helper: animate to provided target positions
      const animateTo = (targetFn, options = {}) => {
        const { duration = 800, ease = d3.easeCubicInOut } = options;
        const sel = svg.selectAll('.particle');
        sel.interrupt();
        sel.transition()
          .duration(duration)
          .ease(ease)
          .attr('cx', d => targetFn(d).x)
          .attr('cy', d => targetFn(d).y)
          .attr('r', d => (options.r != null ? options.r : 4))
          .attr('opacity', options.opacity != null ? options.opacity : 0.95);
      };

      // target: bottom-center (a little above the bottom of the svg)
      const convergeToBottomCenter = () => {
        animateTo(() => ({ x: centerX, y: height - 60 }), { duration: 900 });
      };

      // target: scatter across the scene (randomized spread)
      const spreadEverywhere = () => {
        const sel = svg.selectAll('.particle');
        sel.interrupt();
        sel.transition()
          .duration(1200)
          .ease(d3.easeCubicOut)
          .attr('cx', () => centerX - maxRadius + Math.random() * (maxRadius * 2))
          .attr('cy', () => centerY - maxRadius + Math.random() * (maxRadius * 2))
          .attr('r', 4)
          .attr('opacity', 0.95);
      };

      // Ensure initial gathering completes first. animateParticles(true) is triggered
      // by the IntersectionObserver; mark gathering done after an estimated duration.
      const estimatedEntranceTime = 100 + data.length * 6 + 200; // ms buffer
      setTimeout(() => { gathered = true; phase = 'idle'; }, estimatedEntranceTime);

      const onScroll = () => {
        if (!svgRef.current) return;
        const scrollTop = window.scrollY || window.pageYOffset || 0;
        const windowH = window.innerHeight;
        const docH = document.documentElement.scrollHeight;
        const scrolled = docH > windowH ? scrollTop / (docH - windowH) : 0;

        // no React state update here; positions follow scroll directly

        // if not yet gathered, ignore scroll-driven moves
        if (!gathered) return;

        if (scrolled <= 0.5) {
          animateParticles(true);
        } else {
          svg.selectAll('.particle')
          .transition()
          .duration(800)
          .attr('cx', width/2)
          .attr('cy', height)
        }
      };

      window.addEventListener('scroll', onScroll, { passive: true });

      // set cleanup function to remove listener(s) and disconnect observer
      cleanupFn = () => {
        try { window.removeEventListener('scroll', onScroll); } catch (e) {}
        try { if (obs) obs.disconnect(); } catch (e) {}
      };
      // also attach to svgRef in case other code wants to call it
      if (svgRef.current) svgRef.current.__gravityCleanup = cleanupFn;


      // Add center label
      svg.append('text')
        .attr('x', centerX)
        .attr('y', centerY + 8)
        .attr('text-anchor', 'middle')
        .attr('font-size', '13px')
        .attr('fill', '#FFF')
        .text('Social problem solving');

      // Add gradient legend (graduated color bar)
      const legendX = 0;
      const legendY = height - 90;
      const legendWidth = 180;
      const legendHeight = 12;

  // Define gradient stops using the colorScale (white -> black)
  const defs = svg.append('defs');
  const grad = defs.append('linearGradient').attr('id', 'empGradient');
  grad.append('stop').attr('offset', '10%').attr('stop-color', colorScale(0));
  grad.append('stop').attr('offset', '60%').attr('stop-color', colorScale(2.5));
  grad.append('stop').attr('offset', '100%').attr('stop-color', colorScale(5));

      const legend = svg.append('g')
        .attr('transform', `translate(${legendX}, ${legendY})`);

      legend.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('fill', 'url(#empGradient)');

      // legend axis
      const legendScale = d3.scaleLinear().domain([0, 5]).range([0, legendWidth]);
      const legendAxis = d3.axisBottom(legendScale).ticks(3).tickFormat(d3.format('.1f'));
      legend.append('g')
        .attr('transform', `translate(0, ${legendHeight})`)
        .call(legendAxis)
        .selectAll('text')
        .attr('font-size', '11px');

      legend.append('text')
        .attr('x', 0)
        .attr('y', -8)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text('Empathy (white = center / low → black = outer / high)');

    

  };
    loadData().catch(err => console.error('Error in loadData:', err));

    // cleanup function will be called on effect cleanup/unmount
    return () => {
      try {
        if (cleanupFn && typeof cleanupFn === 'function') cleanupFn();
      } catch (e) {}
      // also clear svg-stored cleanup if present
      try {
        if (svgRef.current && typeof svgRef.current.__gravityCleanup === 'function') {
          svgRef.current.__gravityCleanup();
          delete svgRef.current.__gravityCleanup;
        }
      } catch (e) {}
    };
  }, [currentCountry, studentRows]);

  return (
    <div style={{ width: '100%', minHeight: '800px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}