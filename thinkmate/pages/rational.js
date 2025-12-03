import Head from 'next/head';
import styles from '../styles/Home.module.css';
import SlopeChart from '../components/visualization/slopeChart';
import LollipopChart from '../components/visualization/lollipopChart';
import CreativityScatter from '../components/visualization/creativityScatterPlot'; 
import BeeSwarmPlot from '../components/visualization/beeSwarmPlot';
import GravityScatterPlot from '../components/visualization/gravity';
import GroupBarChart from '../components/visualization/groupBarChart';
import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import ConvergingParticles from '../components/beforeGalaxy';


import itemsList from './api/data/news';
import useCountryStats from '../hooks/useCountryStats';
import CardGallery from '../components/cardGallery';



const serverHostName = process.env.DATABRICKS_SERVER_HOSTNAME;
const token = process.env.DATABRICKS_TOKEN;
const httpPath = process.env.DATABRICKS_HTTP_PATH;

export default function RationalPage({ countries = []}) {
  // Component state must be created inside the component using hooks
  const [country, setCountry] = useState(null);
  // Use the client-safe SWR hook which fetches from `/api/data/getStudentsByCountry`
  // This avoids importing server-only modules into the browser bundle.
  const { data: studentData } = useCountryStats(country);
  
  // Ensure we render strings for country buttons
  const countryList = Array.isArray(countries)
    ? countries.map((c, i) => (typeof c === 'string' ? c : (c?.country ?? `country-${i}`)))
    : [];

  // Split-button state: controls the floating split control on the left
  const [splitMenuOpen, setSplitMenuOpen] = useState(false);
  const [splitSelected, setSplitSelected] = useState(country || (countryList.length ? countryList[0] : null));

  // Keep the split-selected label in sync with the active `country`.
  useEffect(() => {
    if (country) {
      setSplitSelected(country);
    } else if (!country && countryList && countryList.length > 0) {
      // fallback to first country when none selected
      setSplitSelected(countryList[0]);
    }
  }, [country, countryList]);

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
  const studentNum = filteredStudentData ? filteredStudentData.length : 0;

  // If `country` is a string (name), find its full data object from `countries`.
  const selectedCountryData = country && Array.isArray(countries)
    ? countries.find((c) => c.country === country) || null
    : null;


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
      {/* Floating split control: main = reselect (opens small list), arrow = apply/fetch (sets country) */}
      <div className={styles.floatingSplit}>
        <motion.button
          className={styles.floatingSplitMain}
          aria-haspopup="menu"
          aria-expanded={splitMenuOpen}
          onClick={() => setSplitMenuOpen((s) => !s)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 1.1 }}
        >
          <span style={{ fontSize: 14, color: '#111' }}>{splitSelected || 'All'}</span>
        </motion.button>

     
        {splitMenuOpen && countryList.length > 0 && (
          <div className={styles.floatingSplitMenu} role="menu">
            {countryList.map((c) => (
              <button
                key={c}
                className={styles.floatingSplitMenuItem}
                onClick={() => {
                  setSplitSelected(c);
                  setCountry(c);
                  setSplitMenuOpen(false);
                }}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
    <div className={styles.title} style={{ maxWidth: '100%', margin: '3rem auto', textAlign: 'center', fontFamily: 'NanumSquareNeo' }}>
      <p style={{fontWeight:'600', fontSize:'1.5rem'}}>Empathy in Student: Unlocking creative solutions to social challenges</p>
         
    </div>
    <div style={{overflowX: 'hidden'}}>
      <CardGallery cardsList={itemsList} />
    </div>
    <div style={{  alignItems: 'center' , textAlign: 'center', fontFamily: 'NanumSquareNeo', maxWidth: '90%', margin: '1rem auto', paddingBottom: '4rem' }}>
     
          <p className={styles.subtitle} style={{ fontSize: '1.2rem', lineHeight: 2, padding: '5rem 0'}}>
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
                    key={c}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setCountry(c)}
                    className={
                      `${styles.countryButton} ${country === c ? styles.countryButtonActive : ""}`
                    }
                  >
                    {c}
                  </motion.button>
              ))
            )}
          </div>
        </div>
        </div>
      {country === null ? (
              <div style={{ color: '#AAA', fontStyle: 'italic', fontWeight: '800', padding: '5rem', textAlign: 'center', fontSize: '1.3rem'}}>Select country to see the data.</div>
            ) : (
              <>
          <div style={{textAlign: 'center', fontFamily: 'NanumSquareNeo' }}>
          <p style={{ textAlign: 'center', marginTop: 8, fontSize: '1.2rem', paddingBottom: '1rem' }}><strong>Selected country:</strong> {country}</p>
          <SlopeChart currentCountry={country} countryData={countries} />
            <div>
              {selectedCountryData ? (
                selectedCountryData.overallScore < selectedCountryData.socialSuccess ? (
                  <p>{selectedCountryData.country} has more social success than overall creativity.</p>
                ) : selectedCountryData.overallScore > selectedCountryData.socialSuccess ? (
                  <p>{selectedCountryData.country} has higher overall creativity than social success.</p>
                ) : (
                  <p>{selectedCountryData.country} has similar overall creativity and social success.</p>
                )
              ) : (
                <p>Summary data not available for <strong>{country}</strong>.</p>
              )}
            </div>

          <p className={styles.subtitle} style={{ fontSize: '1.2rem', lineHeight: 1.6 }}>
          IT is really a problem, especially comparing between students. </p>
          
              <BeeSwarmPlot studentRows={filteredStudentData} />
        <p className={styles.subtitle} style={{ fontSize: '1.2rem', lineHeight: 1.6 }}>
          Look at the distribution of empathy and creativity scores among students.
          <br />Compare number of students between overall creativity and social problem solving creativity.
          <br /> Although they possess high creativity, they struggle when the problems narrow down to social problems.
          <br /> This is directly related to the unsolved conflicts within our society.</p>

        <h3 style={{ color: '#333', paddingBottom: '6rem', paddingTop: '1rem'}}>
          How can we solve this problem?</h3>
          
        <LollipopChart currentCountry={country} countryData={countries} />
        
         <h3 style={{ color: '#333' }}>We can find the hint in <strong>empathy.</strong></h3>
         <p style={{ lineHeight: 1.6 }}>
          <br /> Chart above is about confidence in self-directed learning, and social and emotional skills.
          <br />We can see that students who has higher empathy score tends to have higher confidence in self-directed learning index.
        <br />It shows change in the index of confidence in self-directed learning index with a one-unit increase in each of the social and emotional skills (SES) indices after accounting for students' and schools' socio-economic profile, and mathematics performance. 
          < br />
        </p>

         <h3 style={{ color: '#333', paddingTop: '6rem' }}>Let's take a deep look.</h3>
         <p style={{ lineHeight: 1.6 }}>  
          How's your class like? choose the grade. 
          <br /> And take a look at the gender. Click the bar.
         </p>
         <p style={{ lineHeight: 1.6 }} id="bar-explanation">  
          </p>


        <div style={{alignItems: 'center', justifyContent: 'center', display: 'flex', gap: '2rem', paddingTop: '2rem' }}>
          <GroupBarChart studentRows={filteredStudentData} onBarClick={handleBarClick} />
          <CreativityScatter studentRows={creativityRows} />
        </div>
          

    <div style={{ fontFamily: 'NanumSquareNeo', fontWeight: '600', textAlign: 'center', background: 'linear-gradient(180deg, #fff 0%, #020202 30%)' }}>
      <h3 style={{ color: '#333' }}>What can we do for students' future?</h3>
      <p style={{lineHeight: 1.6, fontWeight: 400}}> We need to foster students' social problem solving skills. 
        <br /> For that, we need to provide learning experiences to think about their society. </p>
        <GravityScatterPlot currentCountry={country} studentRows={filteredStudentData} />
        <div>
          <ConvergingParticles studentsNum={studentNum}/>
        </div>
        
    </div>


    <div style={{ background: '#020202' }}>
     
    </div>
  </div>
    </>
        )} 

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
