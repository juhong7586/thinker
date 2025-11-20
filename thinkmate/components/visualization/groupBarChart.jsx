import React from 'react';

export default function GroupBarChart({ studentRows = [] }) {
	// Aggregate ave_emp by grade
	const groups = new Map();

	for (const r of studentRows || []) {
		if (!r) continue;
		// support both normalized rows (with ave_emp) and raw shapes
		const ave = Number(r.ave_emp ?? r.empathy_score ?? r.empathy ?? NaN);
		const gradeVal = r.grade ?? r.ST001D01T ?? '';
		const grade = String(gradeVal).trim() || 'Unknown';
		if (Number.isNaN(ave)) continue;
		const key = String(grade);
		if (!groups.has(key)) groups.set(key, { sum: 0, count: 0 });
		const g = groups.get(key);
		g.sum += ave;
		g.count += 1;
	}

	// Build array of { grade, avg }
	const data = Array.from(groups.entries()).map(([grade, { sum, count }]) => ({
		grade,
		avg: count > 0 ? sum / count : 0,
		count
	}));

    console.log(data);
    
	// Sort grades: try numeric sort if possible, otherwise lexicographic
	data.sort((a, b) => {
		const na = Number(a.grade);
		const nb = Number(b.grade);
		if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
		return String(a.grade).localeCompare(String(b.grade));
	});

	// If no data, render placeholder
	if (data.length === 0) {
		return <div style={{ color: '#666' }}>No grade empathy data available</div>;
	}

	// Simple SVG bar chart
	const width = 520;
	const height = 220;
	const padding = { top: 20, right: 20, bottom: 40, left: 40 };
	const chartWidth = width - padding.left - padding.right;
	const chartHeight = height - padding.top - padding.bottom;
	const max = Math.max(...data.map((d) => d.avg), 1);
	const barWidth = chartWidth / data.length;

	return (
		<div style={{ width, fontFamily: 'Inter, system-ui, sans-serif' }}>
			<svg width={width} height={height}>
				<g transform={`translate(${padding.left},${padding.top})`}>
					{data.map((d, i) => {
						const h = (d.avg / max) * chartHeight;
						const x = i * barWidth + barWidth * 0.1;
						const w = Math.max(4, barWidth * 0.8);
						const y = chartHeight - h;
						return (
							<g key={d.grade}>
								<rect
									x={x}
									y={y}
									width={w}
									height={h}
									fill="#3b82f6"
									rx={4}
								/>
								<text x={x + w / 2} y={chartHeight + 14} fontSize={12} fill="#111" textAnchor="middle">
									{d.grade}
								</text>
								<text x={x + w / 2} y={y - 6} fontSize={11} fill="#111" textAnchor="middle">
									{d.avg.toFixed(1)}
								</text>
							</g>
						);
					})}

					{/* y-axis ticks */}
					{[0, 0.25, 0.5, 0.75, 1].map((t) => {
						const vy = chartHeight - t * chartHeight;
						const val = (t * max).toFixed(1);
						return (
							<g key={t}>
								<line x1={-6} x2={chartWidth} y1={vy} y2={vy} stroke="#eee" />
								<text x={-10} y={vy + 4} fontSize={10} fill="#666" textAnchor="end">
									{val}
								</text>
							</g>
						);
					})}
				</g>
			</svg>
		</div>
	);
}