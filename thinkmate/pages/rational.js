import Head from 'next/head';
import styles from '../styles/Home.module.css';
import SlopeChart from '../components/visualization/slopeChart';
import LollipopChart from '../components/visualization/lollipopChart';
import ScatterPlot from '../components/visualization/creativityScatterPlot'; 
import CreativityScatter from '../components/visualization/beeSwarmPlot';
import GravityScatterPlot from '../components/visualization/gravity';
import GroupBarChart from '../components/visualization/groupBarChart';
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';

import galleryItems, { items as newsItems } from './api/data/news';
import useCountryStats from '../hooks/useCountryStats';
import CircularGallery from '../components/circularGallery';



const serverHostName = process.env.DATABRICKS_SERVER_HOSTNAME;
const token = process.env.DATABRICKS_TOKEN;
const httpPath = process.env.DATABRICKS_HTTP_PATH;

export default function RationalPage({ countries = []}) {
  // Component state must be created inside the component using hooks
  const [country, setCountry] = useState(null);
  // Use the client-safe SWR hook which fetches from `/api/data/getStudentsByCountry`
  // This avoids importing server-only modules into the browser bundle.
  const { data: studentData, loading: studentLoading, error: studentError } = useCountryStats(country);

  // Ensure we render strings for country buttons
  const countryList = Array.isArray(countries)
    ? countries.map((c, i) => (typeof c === 'string' ? c : (c?.country ?? `country-${i}`)))
    : [];

  // // If `country` is falsy we pass through the original array (show all).
  let filteredStudentData = [];
  if (Array.isArray(studentData)) {
    if (!country) {
      filteredStudentData = studentData;
    } else {
      filteredStudentData = studentData.filter((r) => {
        if (!r) return false;
        // Support several possible key names for country in rows
        const rowCountry = r.country ?? r.Country ?? r.country_name ?? r.countryName ?? null;
        return rowCountry === country;
      });
    }
  }

  // Bar filter state: { grade, gender }
  const [barFilter, setBarFilter] = useState({ grade: null, gender: null });

  const creativityRows = useMemo(() => {
    if (!Array.isArray(filteredStudentData)) return [];
    const { grade: fGrade, gender: fGender } = barFilter || {};
    return filteredStudentData.filter((r) => {
      if (!r) return false;
      if (fGrade) {
        const rowGrade = r.grade ?? r.ST001D01T ?? '';
        if (String(rowGrade) !== String(fGrade)) return false;
      }
      if (fGender) {
        const rowGender = r.gender ?? r.ST004D01T ?? null;
        // In dataset gender encoding might be 1 (female) / 2 (male) or strings
        if (fGender === 'female' && String(rowGender) !== '1') return false;
        if (fGender === 'male' && String(rowGender) !== '2') return false;
      }
      return true;
    });
  }, [filteredStudentData, barFilter]);

  const handleBarClick = ({ grade, gender }) => {
    // toggle same selection
    if (barFilter.grade === grade && barFilter.gender === gender) {
      setBarFilter({ grade: null, gender: null });
    } else {
      setBarFilter({ grade, gender });
    }
  };


  return (
    <>
    
      <Head>
        <title>Rational — ThinkMate</title>
        <meta name="description" content="Rational info: how empathy and creativity relate" />
      </Head>
    <div className={styles.title} style={{ maxWidth: '100%', margin: '3rem auto', textAlign: 'center', fontFamily: 'NanumSquareNeo' }}>
      <p style={{fontWeight:'600', fontSize:'1.5rem'}}>Empathy in Student: Unlocking creative solutions to social challenges</p>
         
    </div>
    <div>
      <CircularGallery items={galleryItems} bend={0} heightScale={1.1} font={'normal 30px Times New Roman'} />
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

          <CreativityScatter studentRows={filteredStudentData} />
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
        <div style={{alignItems: 'center' , justifyContent: 'center', display: 'flex', gap: '2rem' }}>
          <GroupBarChart studentRows={filteredStudentData} onBarClick={handleBarClick} />
          <ScatterPlot studentRows={creativityRows} />
        </div>
          
    </div>
    <div style={{ background: 'linear-gradient(to bottom, #ffffff 30%, #020202 70%)', width: '100vw', height: '30vh', fontFamily: 'NanumSquareNeo', fontWeight: '600', textAlign: 'center' }}>
      <h3 style={{ color: '#333' }}>What can we do for students' future?</h3>
      <p style={{lineHeight: 1.6, fontWeight: 400}}> We need to foster students' social problem solving skills. 
        <br /> For that, we need to provide learning experiences to think about their society. </p>
    </div>
    <div style={{ background: '#020202', width: '100vw' }}>
      <GravityScatterPlot currentCountry={country} studentRows={filteredStudentData} />
    </div>
    
    </>
  );
}

export async function getStaticProps() {
    // Use the SWR hook to fetch per-country student rows (client-safe)
  
  // SQL used to build the country summary. Keep this local so it's easy to reuse.
  const sql = `
    SELECT *
    FROM workspace.students.emp_cr_by_country
  `;

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
}
