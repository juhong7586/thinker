import useSWR from 'swr';

const fetcher = (url) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
});


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

      }).filter(Boolean)
    : null;

  return {
    data: normalized,
    loading: isLoading,
    error
  };
}
