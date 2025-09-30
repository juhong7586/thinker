// Small clustering utilities used by analysis and other pages
// - normalizeField: trims and lowercases field keys
// - groupInterestsByField: groups interest objects by normalized field
// - computeClusterAnalysis: produce display-ready cluster summaries

const normalizeField = (field) => {
  if (field == null) return 'unknown';
  return String(field).trim();
}

export function groupInterestsByField(interests = []) {
  const map = new Map();
  for (const it of interests) {
    const key = normalizeField(it.field) || 'Unknown';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(it);
  }
  return Array.from(map.entries()).map(([field, items]) => ({ field, items }));
}

export function computeClusterAnalysis(groups = [], students = []) {
  return groups
    .filter(group => Array.isArray(group.items) && group.items.length > 1)
    .map(group => {
      const avgLevel = (
        group.items.reduce((sum, item) => sum + (Number(item.level) || 0), 0) / group.items.length
      ).toFixed(1);
      const studentNames = group.items.map(item => {
        const student = students.find(s => s.id === item.studentId);
        return student ? student.user.name : 'Unknown';
      });
      return {
        field: group.field,
        memberCount: group.items.length,
        students: studentNames,
        avgLevel
      };
    });
}

export default {
  normalizeField,
  groupInterestsByField,
  computeClusterAnalysis
};
