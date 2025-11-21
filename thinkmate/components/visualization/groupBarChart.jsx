import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function GroupBarChart({ studentRows = [] }) {
	const svgRef = useRef(null);

	useEffect(() => {
		// Prepare raw data
		const raw = Array.isArray(studentRows) ? studentRows : [];
		// Aggregate ave_emp by grade
		const groups = new Map();
		const groupsFemale = new Map();
		const groupsMale = new Map();

		for (const r of raw) {
			if (!r) continue;
			const ave = Number(r.ave_emp ?? NaN);
			const grade = r.grade ?? r.ST001D01T ?? '';
			if (Number.isNaN(ave)) continue;
			let key = grade;
			if (grade == 96){
				key = 'Ungraded';
			} else if (grade == 97){
				key = 'Not Applicable';
			} else if (grade == 98){
				key = 'Invalid';
			} else if (grade == 99){
				key = 'Missing';
			}


			if (!groups.has(key)) groups.set(key, { sum: 0, count: 0 });
			const g = groups.get(key);
			g.sum += ave;
			g.count += 1;
			const gender = r.gender ?? r.ST004D01T ?? '';
			if (!groupsFemale.has(key) && gender == 1){
				groupsFemale.set(key, { sum: 0, count: 0 });
				const gf = groupsFemale.get(key);
				gf.sum += ave;
				gf.count += 1;
			}else if (!groupsMale.has(key) && gender == 2){
				groupsMale.set(key, { sum: 0, count: 0 });
				const gm = groupsMale.get(key);
				gm.sum += ave;
				gm.count += 1;
			}

		}

		const data = Array.from(groups.entries()).map(([grade, { sum, count }]) => ({
			grade,
			avg: count > 0 ? sum / count : 0,
			count
		}));

		const dataFemale = Array.from(groupsFemale.entries()).map(([grade, { sum, count }]) => ({
			grade,
			avg: count > 0 ? sum / count : 0,
			count
		}));
	

		const dataMale = Array.from(groupsMale.entries()).map(([grade, { sum, count }]) => ({
			grade,
			avg: count > 0 ? sum / count : 0,
			count
		}));

		// sort grades
		data.sort((a, b) => {
			const na = Number(a.grade);
			const nb = Number(b.grade);
			if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
			return String(a.grade).localeCompare(String(b.grade));
		});

		// D3 render
		const svg = d3.select(svgRef.current);
		svg.selectAll('*').remove();

		const width = 520;
		const height = 360;
		const margin = { top: 100, right: 20, bottom: 50, left: 48 };
		const w = width - margin.left - margin.right;
		const h = height - margin.top - margin.bottom;

		svg.attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMidYMid meet');

		const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

		if (data.length === 0) {
			g.append('text').attr('x', w / 2).attr('y', h / 2).attr('text-anchor', 'middle').attr('fill', '#666').text('No grade empathy data available');
			return;
		}

		const x = d3.scaleBand().domain(data.map((d) => d.grade)).range([0, w]).padding(0.2);
		const maxVal = d3.max([d3.max(data, (d) => d.avg), d3.max(dataFemale, (d) => d.avg), d3.max(dataMale, (d) => d.avg)]) ?? 1;
		const y = d3.scaleLinear().domain([0, maxVal]).nice().range([h, 0]);

		// x axis
		g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x)).selectAll('text').attr('font-size', 11).attr('fill', '#111');

		// y axis
		g.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').attr('font-size', 11).attr('fill', '#111');

		// gridlines
		g.append('g')
			.attr('class', 'grid')
			.call(d3.axisLeft(y).tickSize(-w).tickFormat(() => '').ticks(5))
			.selectAll('line')
			.attr('stroke', '#eee');

		// grade average bars
		const bars = g.selectAll('.bar').data(data, (d) => d.grade).join('g').attr('class', 'bar');

		bars
			.append('rect')
			.attr('x', (d) => x(d.grade))
			.attr('y', (d) => y(d.avg))
			.attr('width', x.bandwidth())
			.attr('height', (d) => h - y(d.avg))
			.attr('fill', 'rgba(245,226, 190, 0.8)')
			.attr('rx', 4);

		// value labels
		bars
			.append('text')
			.attr('x', (d) => x(d.grade) + x.bandwidth() / 2)
			.attr('y', (d) => y(d.avg) - 6)
			.attr('text-anchor', 'middle')
			.attr('font-size', 11)
			.attr('fill', '#111')
			.text((d) => d.avg.toFixed(1));

		// x labels adjusted
		// done by axisBottom

		
		// Female average bars 
		const barsFemale = g.selectAll('.barFemale').data(dataFemale, (d) => d.grade).join('g').attr('class', 'barFemale');
		
		barsFemale
			.append('rect')
			.attr('x', (d) => x(d.grade) + x.bandwidth() / 2)
			.attr('y', (d) => y(d.avg))
			.attr('width', x.bandwidth() / 2)
			.attr('height', (d) => h - y(d.avg))
			.attr('fill', 'rgba(113, 83, 86, 0.5)')
			.attr('rx', 4);

		barsFemale
			.append('text')
			.attr('x', (d) => x(d.grade) + x.bandwidth() * 3 / 4)
			.attr('y', (d) => y(d.avg) - 6)
			.attr('text-anchor', 'middle')
			.attr('font-size', 11)
			.attr('fill', '#111')
			.text((d) => d.avg.toFixed(1));		
		
		// Male average bars
		const barsMale = g.selectAll('.barMale').data(dataMale, (d) => d.grade).join('g').attr('class', 'barMale');
		
		barsMale
			.append('rect')
			.attr('x', (d) => x(d.grade))
			.attr('y', (d) => y(d.avg))
			.attr('width', x.bandwidth() / 2)
			.attr('height', (d) => h - y(d.avg))
			.attr('fill', 'rgba(55, 75, 71, 0.5)')
			.attr('rx', 4);
			
		barsMale
			.append('text')
			.attr('x', (d) => x(d.grade) + x.bandwidth() / 4)
			.attr('y', (d) => y(d.avg) - 6)
			.attr('text-anchor', 'middle')
			.attr('font-size', 11)
			.attr('fill', '#111')
			.text((d) => d.avg.toFixed(1));	
		
		// Legend
		const legend = svg.append('g').attr('transform', `translate(${width - margin.right - 120},${margin.top}-30)`);

		const legendItems = [
			{ label: 'Overall Average', color: 'rgba(245,226, 190, 0.8)' },
			{ label: 'Female Average', color: 'rgba(113, 83, 86, 0.5)' },		
			{ label: 'Male Average', color: 'rgba(55, 75, 71, 0.5)' }
		];

		legendItems.forEach((item, index) => {
			const legendRow = legend.append('g').attr('transform', `translate(0, ${index * 20})`);
			
			legendRow.append('rect')
				.attr('width', 12)
				.attr('height', 12)
				.attr('fill', item.color)
				.attr('rx', 2);
					
			legendRow.append('text')
				.attr('x', 18)
				.attr('y', 10)
				.attr('font-size', 11)
				.attr('fill', '#111')
				.text(item.label);
		});

		// cleanup on unmount
		return () => {
			svg.selectAll('*').remove();
		};
	}, [studentRows]);

	return (
		<div style={{ maxWidth: '50%', maxWidth: 720 }}>
			<svg ref={svgRef} style={{ width: '100%', height: 300 }} />
		</div>
	);
}