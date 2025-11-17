import Head from 'next/head';
import BubbleMenu from '../components/BubbleMenu';
import styles from '../styles/Home.module.css';
import SlopeChart from '../components/visualization/slopeChart';
import LollipopChart from '../components/visualization/lollipopChart';
import ScatterPlot from '../components/visualization/scatterPlot'; 
import CreativityScatter from '../components/visualization/creativityScatter';
import GravityScatterPlot from '../components/visualization/gravity';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { mutate } from 'swr';
import items from './api/data/news';
import useCountryStats from '../hooks/useCountryStats';

// items are imported from `data/news.js`

const serverHostName = process.env.DATABRICKS_SERVER_HOSTNAME;
const token = process.env.DATABRICKS_TOKEN;
const httpPath = process.env.DATABRICKS_HTTP_PATH;

export default function RationalPage({ countries = [] }) {
  // Component state must be created inside the component using hooks
  const [country, setCountry] = useState(null);

  // Ensure we render strings for country buttons
  const countryList = Array.isArray(countries)
    ? countries.map((c, i) => (typeof c === 'string' ? c : (c?.country ?? `country-${i}`)))
    : [];

  // Use the SWR hook to fetch per-country student rows (client-safe)
  const { data: studentData, loading: studentLoading, error: studentError } = useCountryStats(country);

  useEffect(() => {
    if (!country) return;
    const key = `/api/data/getStudentsByCountry?country=${encodeURIComponent(country)}`;
    // Prefetch server data for the selected country and prime the SWR cache
    (async () => {
      try {
        const res = await fetch(key);
        if (!res.ok) throw new Error('Network response was not ok');
        const json = await res.json();
        // Populate SWR cache for the key without revalidating (fast path)
        await mutate(key, json, false);
      } catch (err) {
        console.warn('prefetch failed', err);
      }
    })();
  }, [country]);

  return (
    <>
    
      <Head>
        <title>Rational — ThinkMate</title>
        <meta name="description" content="Rational info: how empathy and creativity relate" />
      </Head>
    <div className={styles.title} style={{ maxWidth: '100%', margin: '3rem auto', textAlign: 'center' }}>
      <p style={{fontWeight:'600', fontSize:'1.5rem'}}>Empathy in Student: Unlocking creative solutions to social challenges</p>
         
    </div>
    <div style={{ maxWidth: '90%', margin: '1rem auto', padding: '4rem 0', fontFamily: 'NanumSquareNeo' }}>
        {/* BubbleMenu placed at the top of the page */}
        <BubbleMenu
          logo={<span style={{ fontWeight: 700 }}>RB</span>}
          items={items}
          menuAriaLabel="Toggle navigation"
          menuBg="#ffffff"
          useFixedPosition={false}
          alwaysVisible={true}
          animationEase="back.out(1.5)"
          animationDuration={0.5}
          staggerDelay={0.12}
        />
    </div>
    <div style={{  alignItems: 'center' , textAlign: 'center', fontFamily: 'NanumSquareNeo', maxWidth: '90%', margin: '1rem auto', paddingBottom: '4rem' }}>
     
          <p className={styles.subtitle} style={{ fontSize: '1.3rem', lineHeight: 2, padding: '5rem 0'}}>
          What would these issues mean for our students? 
          <br />They do think these problems are important, however, they do not think they should make a difference.
          <br />How would these problems impact on them? Would it be okay to let them ignore these issues?
          <br />As someone to guide our students, how can we solve them?</p>
          <p className={styles.subtitle} style={{ fontSize: '1.3rem'}}><i>Please select your country.</i></p>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0', padding: '2rem 0' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', maxWidth: '100%' }}>
            {countryList.length === 0 ? (
              <div style={{ color: '#666' }}>Loading countries…</div>
            ) : (
              countryList.map((c, idx) => (
                <motion.button
                  key={`${c}-${idx}`}
                  onClick={() => setCountry(c)}
                  aria-pressed={country === c}
                  style={{
                    padding: country === c ? '8px 16px' : '6px 12px',
                    borderRadius: 18,
                    border: country === c ? '2px solid #111' : '1px solid #ddd',
                    background: country === c ? '#f3f4f6' : '#fff',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transformOrigin: 'center'
                  }}
                  animate={country === c ? { scale: 1.1 } : { scale: 1 }}
                  transition ={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {c}
                  </motion.button>
              ))
            )}
          </div>
        </div>

        {country && (
          <p style={{ textAlign: 'center', marginTop: 8 }}><strong>Selected country:</strong> {country}</p>
        )}
          <SlopeChart currentCountry={country} countryData={countries} />
          <p className={styles.subtitle} style={{ fontSize: '1rem', lineHeight: 1.6 }}>
          IT is really a problem, especially comparing between students. </p>

          <CreativityScatter studentRows={studentData} />
        <p className={styles.subtitle} style={{ fontSize: '1rem', lineHeight: 1.6 }}>
          
          Look at the distribution of empathy and creativity scores among students.
          <br />Compare number of students between overall creativity and social problem solving creativity.
          <br /> Although they possess high creativity, they struggle when the problems narrow down to social problems.
          <br /> This is directly related to the unsolved conflicts within our society.</p>

        <h3 className={styles.subtitle} style={{ fontWeight: 700, textAlign: 'center', fontStyle: 'italic' }}>How can we solve this problem?</h3>
        <LollipopChart currentCountry={country} countryData={countries} />
        <p style={{ lineHeight: 1.6 }}>
          We can find hint in empathy. Chart above is about confidence in self-directed learning, and social and emotional skills.
          <br />It shows change in the index of confidence in self-directed learning index with a one-unit increase in each of the social and emotional skills (SES) indices after accounting for students' and schools' socio-economic profile, and mathematics performance. 
          <br />We can see that students who has higher empathy score tends to have higher confidence in self-directed learning index.
        </p>
        <ScatterPlot studentRows={studentData} />
          
    </div>
    <div style={{ background: 'linear-gradient(to bottom, #ffffff, #0e0e0e)', width: '100vw', padding: '40px 0' , height: '30vh'}}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>What can we do for students' future?</h1>
    </div>
    <div style={{ background: '#0e0e0e', width: '100vw' }}>
      <GravityScatterPlot currentCountry={country} studentRows={studentData} />
    </div>
    
    </>
  );
}



  try {
    let rows = [];

    if (serverHostName && token && httpPath) {
      // Try using the @databricks/sql client if env vars are provided.
      // Use await to ensure the query completes before returning props.
      try {
        const { DBSQLClient } = require('@databricks/sql');
        const client = new DBSQLClient();
        const connectOptions = { token, host: serverHostName, path: httpPath };
        await client.connect(connectOptions);
        const session = await client.openSession();
        const queryOperation = await session.executeStatement(sql, { runAsync: true });
        const result = await queryOperation.fetchAll();
        await queryOperation.close();
        await session.close();
        await client.close();
        rows = result || [];

      } catch (err) {
        console.error('Databricks client query failed, falling back to API route:', err.message || err);
        rows = [];
        studentData = [];
      }
    }

    // Normalize returned rows (support both array-of-objects and array-of-arrays)
    const countries = (rows || [])
      .map(r => {
        if (!r) return null;
        // If row is an object with keys
        if (typeof r === 'object' && !Array.isArray(r) && r.country) {
          return {
            country: r.country,
            overallScore: Number(r.overallScore ?? r.overall_score ?? 0),
            socialSuccess: Number(r.socialSuccess ?? r.social_success ?? 0),
            empathyScore: Number(r.empathy_score ?? r.empathy_score ?? 0)
          };
        }
        // If row is an array-like result [country, overallScore, socialSuccess, cnt]
        if (Array.isArray(r)) {
          return {
            country: r[0],
            overallScore: Number(r[1] ?? 0),
            socialSuccess: Number(r[2] ?? 0),
            empathyScore: Number(r[3] ?? 0)
          };
        }
        return null;
      })
      .filter(Boolean);

    return {
      props: { countries },
      revalidate: 86400
    };

} catch (err) {
  console.error('getStaticProps unexpected error:', err);
  return { props: { countries: [] } };
}

