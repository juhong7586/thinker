import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useEffect, useState, useRef } from 'react'
import * as d3 from 'd3'
import { api } from '../utils/api'
import { groupInterestsByField, computeClusterAnalysis } from '../utils/clustering'

export default function Analysis() {
    const containerRef = useRef();
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [students, setStudents] = useState([]);
  const [interests, setInterests] = useState([]);
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const set = () => {
      const bb = node.getBoundingClientRect();
      setSize({
        width: Math.max(200, Math.round(bb.width)),
        height: Math.max(200, Math.round(bb.height)),
      });
    };
    set();

    const ro = new ResizeObserver(set);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    // load students and interests
    const load = async () => {
      try {
        const [studentsData, interestsData] = await Promise.all([
          api.getStudents(),
          api.getInterests()
        ]);
        setStudents(studentsData || []);
        setInterests(interestsData || []);
      } catch (e) {
        console.error('Failed to load analysis data', e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setClusters(groupInterestsByField(interests || []));
  }, [interests]);

  const getClusterAnalysis = () => {
    return computeClusterAnalysis(clusters, students);
  };

    return (
        <>
         <Head>
        <title>ThinkMate - Cluster Analysis</title>
        <meta name="description" content="Cluster analysis of student interests" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className={styles.container} ref={containerRef}>
        <main className={styles.mainContent}>
         <h1 style={{ marginBottom: '1rem' }}>Cluster Analysis</h1>

         {getClusterAnalysis().length === 0 ? (
           <p>No clusters with multiple members found.</p>
         ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {getClusterAnalysis().map((cluster, index) => (
              <div key={index} style={{ 
                background: 'white', 
                padding: '0.75rem', 
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontWeight: '600', color: '#d97706', marginBottom: '0.25rem' }}>
                  Cluster: {cluster.field} ({cluster.memberCount})
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Members: {cluster.students.join(', ')}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Average Interest: {cluster.avgLevel}/10
                </div>
              </div>
            ))}
          </div>
         )}
        </main>
      </div>
        </>
    )
}
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useEffect, useState, useRef } from 'react'

export default function Analysis() {
    const containerRef = useRef();
  const [size, setSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const set = () => {
      const bb = node.getBoundingClientRect();
      setSize({
        width: Math.max(200, Math.round(bb.width)),
        height: Math.max(200, Math.round(bb.height)),
      });
    };
    set();

    const ro = new ResizeObserver(set);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

    return (
        <>
         <Head>
        <title>ThinkMate - AI 협업 아이디어 플랫폼</title>
        <meta name="description" content="학생들의 관심사를 시각화하고 AI가 프로젝트 아이디어를 제안하는 협업 플랫폼" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className={styles.container}>
        <main className={styles.mainContent}>
         
        </main>
        
        
      </div>
      
        </>
    )
}