import useSWR from 'swr';

const fetcher = (url) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
});

// export default function useCountryStats(country) {
//   const key = country ? `/api/data/getStudentsByCountry?country=${encodeURIComponent(country)}` : null;
//   const { data, error, isLoading } = useSWR(key, fetcher, { revalidateOnFocus: false });
//   // Normalize rows once here so all consumers receive a consistent shape
//   const normalized = (data?.rows || null)
//     ? (data.rows || []).map(r => ({
//         empathy_score: Number(r.empathy_score ?? r.ave_emp ?? r.emp_score ?? NaN),
//         country: r.country,
//         ave_emp: Number(r.ave_emp ?? r.empathy_score ?? r.empathy ?? NaN),
//         ave_cr: Number(r.ave_cr ?? r.overall_cr ?? r.cr ?? NaN),
//         ave_cr_social: Number(r.ave_cr_social ?? r.social_cr ?? NaN),
//         // keep original row for advanced uses
//         __raw: r
//       }))
//     : null;

//   return {
//     data: normalized,
//     loading: isLoading,
//     error
//   };
// }
export default function useCountryStats(country) {
  const key = country ? `/api/data/getStudentsByCountry?country=${encodeURIComponent(country)}` : null;
  const { data, error, isLoading } = useSWR(key, fetcher, { revalidateOnFocus: false });
  // Normalize rows once here so all consumers receive a consistent shape.
  // The API may return either per-student rows (detailed) or per-country
  // summary rows (ave_emp / ave_cr fields). Detect the shape and map
  // accordingly so consumers don't see undefined student fields for summaries.
  const normalized = (data?.rows || null)
    ? (data.rows || []).map((r) => {
        if (!r) return null;

        // If this looks like a student-level row (contains student id or grade fields)
        if (typeof r === 'object' && !Array.isArray(r) && (r.CNTSTUID || r.ST001D01T || r.ST004D01T || r.STRATUM)) {
          return {
            type: 'student',
            country: r.country ?? r.country_name ?? null,
            studentID: r.CNTSTUID ?? r.studentID ?? null,
            grade: r.ST001D01T ?? r.grade ?? null,
            gender: r.ST004D01T ?? r.gender ?? null,
            school: r.STRATUM ?? r.school ?? null,
            ave_emp: Number(r.ave_emp ?? r.empathy_score ?? r.empathy ?? NaN),
            ave_cr: Number(r.ave_cr ?? r.overall_cr ?? r.cr ?? NaN),
            ave_cr_social: Number(r.ave_cr_social ?? r.social_cr ?? NaN),
            __raw: r
          };
        }

        // If this looks like a per-country summary row (contains average fields)
        if (typeof r === 'object' && !Array.isArray(r) && (r.ave_emp !== undefined || r.ave_cr !== undefined || r.overallScore !== undefined)) {
          return {
            type: 'country_summary',
            country: r.country ?? r.country_name ?? r.Country ?? null,
            ave_emp: Number(r.ave_emp ?? r.empathy_score ?? r.empathy ?? NaN),
            ave_cr: Number(r.ave_cr ?? r.overall_cr ?? r.cr ?? NaN),
            ave_cr_social: Number(r.ave_cr_social ?? r.social_cr ?? NaN),
            count: Number(r.cnt ?? r.count ?? 0),
            __raw: r
          };
        }

        // Array rows: decide by length — short arrays are likely summaries
        if (Array.isArray(r)) {
          if (r.length <= 4) {
            // summary-like array: [country, overallScore, socialSuccess, empathyScore]
            return {
              type: 'country_summary',
              country: r[0] ?? null,
              ave_cr: Number(r[1] ?? NaN),
              ave_cr_social: Number(r[2] ?? NaN),
              ave_emp: Number(r[3] ?? NaN),
              __raw: r
            };
          }

          // student-like array: map to student fields by common index layout
          return {
            type: 'student',
            country: r[0] ?? null,
            studentID: r[1] ?? null,
            grade: r[2] ?? null,
            gender: r[3] ?? null,
            school: r[4] ?? null,
            ave_emp: Number(r[5] ?? NaN),
            ave_cr: Number(r[6] ?? NaN),
            ave_cr_social: Number(r[7] ?? NaN),
            __raw: r
          };
        }

        return null;
      }).filter(Boolean)
    : null;

  return {
    data: normalized,
    loading: isLoading,
    error
  };
}
