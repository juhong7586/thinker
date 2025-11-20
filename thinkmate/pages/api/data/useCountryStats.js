import useSWR from 'swr';

const fetcher = (url) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
});

export default function useCountryStats(country) {
  const key = country ? `/api/country-stats}` : null;
  const { data, error, isLoading } = useSWR(fetcher, { revalidateOnFocus: false });
  // Normalize rows
  const normalized = (data?.rows || null)
    ? (data.rows || []).map(r => ({
        empathy_score: Number(r.empathy_score ?? r.ave_emp ?? r.emp_score ?? NaN),
        country: r.country,
        ave_emp: Number(r.ave_emp ?? r.empathy_score ?? r.empathy ?? NaN),
        ave_cr: Number(r.ave_cr ?? r.overall_cr ?? r.cr ?? NaN),
        ave_cr_social: Number(r.ave_cr_social ?? r.social_cr ?? NaN),
        // keep original row for advanced uses
        __raw: r
      }))
    : null;

  return {
    data: normalized,
    loading: isLoading,
    error
  };
}
