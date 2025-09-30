import * as d3 from 'd3';

// Helper to prepare visualization nodes from interests + students
// Returns array of nodes with {_x, _y, _r, color, id, field, studentId, original}
const hashSeed = (s) => {
  let h = 2166136261 >>> 0;
  const str = String(s || '0');
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const deterministicJitter = (seed, mag = 20) => {
  const h = hashSeed(seed + '_j');
  const v = (h % 1000) / 1000;
  return (v * 2 - 1) * mag;
};

const impactToNum = (v) => {
  const s = (v || '').toString().toLowerCase();
  if (s.includes('high')) return 10;
  if (s.includes('moderate') || s.includes('middle') || s.includes('med')) return 5;
  return 1;
};

const getRandomColor = (seed) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFB347'];
    const h = hashSeed(seed);
    return colors[h % colors.length] || colors[0];
    };


export function interestStats(interests = []) {
    const groupResults = Array.from(
      d3.rollup(
        interests,
        v => ({
          count: v.length,
          avgLevel: d3.mean(v, d => d.level),
          avgSocialImpact: d3.mean(v, d => impactToNum(d.socialImpact))
        }),
        d => d.field
      ),
      ([field, stats]) => ({ field, ...stats })
    );

    return groupResults;
};

export function computeVisualizationNodes(groupResults = [], students=[], opts = {}) {
  const {
    width = 900,
    height = 400,
    padding = 20,
    } = opts;

  const xScale = (level = 1) => {
    const min = 1, max = 10;
    const p = padding;
    const range = width - p * 2;
    const t = Math.max(min, Math.min(max, Number(level) || 1));
    return p + ((t - min) / (max - min)) * range;
  };

  const yScale = (impact = 0) => {
    const min = 1, max = 30;
    const p = padding;
    const range = height - p * 2;
    const t = Math.max(min, (Math.min(max, Number(impact) || 0))*3);
    // invert y so higher impact is towards top
    return p + (1 - (t - min) / (max - min)) * range;
  };

  const computeRadius = (d) => {
    const impact = impactToNum(d.avgSocialImpact);
    const level = Number(d.avgLevel) || 1;
    // weighted sum and clamp to reasonable screen sizes
    const base = level * 1.2 + impact * 0.8;
    return Math.max(4, Math.min(40, Math.round(base * 2)));
  };


   const getColor = (students) => {
    return getRandomColor(String(students.field));
   };

  return groupResults.map((d = groupResults, i = students) => {
    const id = d.id ?? i;
    const level = Number(d.avgLevel) || 1;
    const impact = impactToNum(d.avgSocialImpact);
    const jx = deterministicJitter(id + '_x', Math.min(60, width * 0.06));
    const jy = deterministicJitter(id + '_y', Math.min(300, height * 2));
    const _x = Math.max(padding, Math.min(width - padding, xScale(level) + jx));
    const _y = Math.max(padding, Math.min(height - padding, yScale(impact) + jy));
    const _r = computeRadius(d);
    const color = getColor(i);
    return {
      id,
      field: d.field || '',
      studentId: d.studentId,
      _x,
      _y,
      _r,
      color,
      original: d
    };
  });
}

export default computeVisualizationNodes;
