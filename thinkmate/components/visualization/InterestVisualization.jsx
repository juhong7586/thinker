import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from '../../styles/InterestForm.module.css';
import homeStyles from '../../styles/Home.module.css';
import { api } from '../../utils/api';
import {computeVisualizationNodes, interestStats} from '../../utils/visualizationData';

const InterestVisualizationPlotly = dynamic(() => import('./InterestVisualizationPlotly'), { ssr: false });


const InterestVisualization = ({ width: propWidth, height: propHeight, signedUser }) => {
  const [students, setStudents] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clusters, setClusters] = useState([]);
  
  // 폼 상태
  const [currentStudent, setCurrentStudent] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [currentInterest, setCurrentInterest] = useState('');
  // default level should be a valid number so validation can run reliably
  const [currentLevel, setCurrentLevel] = useState(0);
  // default to the placeholder value 'None' so user must choose explicit impact
  const [socialImpact, setSocialImpact] = useState('None');
  const [currentColor, setCurrentColor] = useState('#FF6B6B');
  
  // nodes passed to Plotly
  const [nodes, setNodes] = useState([]);

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFB347'];
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  // when a user is signed in, prefill the registration/add-interest fields
  useEffect(() => {
    if (!signedUser) return;
    // signedUser is the student object returned from the server
    try {
      setSelectedStudentId(signedUser.id || '');
      setCurrentStudent(signedUser.user?.name || '');
      setCurrentEmail(signedUser.user?.email || '');
      setCurrentColor(signedUser.studentColor || signedUser.student?.studentColor || '#FF6B6B');
    } catch (e) {
      // ignore
    }
  }, [signedUser]);

  // recompute nodes when interests or students change
  useEffect(() => {
    if (!interests || interests.length === 0) {
      setNodes([]);
      return;
    }
    const padding = 40;
    const width = propWidth || 900;
    const height = propHeight || 600;
    const groupResults = interestStats(interests);
    const newNodes = computeVisualizationNodes(groupResults, students, { width, height, padding, colors });
    setNodes(newNodes);
  }, [interests, students, propWidth, propHeight]);

  const loadData = async () => {
    try {
      const [studentsData, interestsData] = await Promise.all([
        api.getStudents(),
        api.getInterests()
      ]);
      console.log('✅ Loaded students:', studentsData);
      console.log('✅ Loaded interests:', interestsData);
      setStudents(studentsData);
      setInterests(interestsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('데이터를 불러오는데 실패했습니다.');
    }
  };

  // D3 rendering removed; nodes are passed to Plotly renderer via state

  const handleCreateStudent = async () => {
    if (!currentStudent.trim() || !currentEmail.trim() || !currentColor.trim()) {
      alert('Write your name and email please.');
      return;
    }

    setLoading(true);
    try {
      console.log('[client] creating student with', { name: currentStudent, email: currentEmail, color: currentColor });
      await api.createStudent(currentStudent, currentEmail, currentColor);
      setCurrentStudent('');
      setCurrentEmail('');
      await loadData();
      alert('Created student successfully!');
    } catch (error) {
      console.error('Failed to create student:', error);
      alert('Failed to create student.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInterest = async () => {
    if (!selectedStudentId) {
      alert('Select a student before adding an interest.');
      return;
    }

    if (!currentInterest.trim()) {
      alert('Fill in the interest field please.');
      return;
    }
    if ((!currentLevel) || currentLevel < 1 || currentLevel > 10) {
      alert('Set interest level between 1 and 10.');
      return;
    }
    
    if (socialImpact.trim() === 'None') {
      alert('Select desired social impact please.');
      return;
    }
    

    setLoading(true);
    try {
      await api.createInterest(
        selectedStudentId,
        currentInterest,
        currentLevel,
        socialImpact
      );
      setCurrentInterest('');
      await loadData();
      alert('Added interest!');
    } catch (error) {
      console.error('Failed to add interest:', error);
      alert('Failed to add interest.');
    } finally {
      setLoading(false);
    }
  };


  const getClusterAnalysis = () => {
    return clusters.filter(cluster => cluster.items.length > 1).map(cluster => {
      const avgLevel = (cluster.items.reduce((sum, item) => sum + item.level, 0) / cluster.items.length).toFixed(1);
      const studentNames = cluster.items.map(item => {
        const student = students.find(s => s.id === item.studentId);
        return student ? student.user.name : 'Unknown';
      });
      
      return {
        field: cluster.field,
        memberCount: cluster.items.length,
        students: studentNames,
        avgLevel
      };
    });
  };


  return (
    <>
      
      <div className={homeStyles.fullScreenBox}>
      
   
      <InterestVisualizationPlotly width={propWidth} height={propHeight} nodes={nodes}  />
      
      {/* Register own interests */}
      <div id="register" className={styles.formPanel} >
        <h2 className={styles.formTitle}>Add Interest</h2>
        {/* show signed-in student info if available */}
        {signedUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', background: signedUser.studentColor || signedUser.student?.studentColor || '#999' }} />
            <div>
              <div style={{ fontWeight: 600 }}>{signedUser.user?.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>{signedUser.user?.email}</div>
            </div>
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.label}>What’s a project idea or topic you want to explore?</label>
          <input
            type="text"
            value={currentInterest}
            onChange={(e) => setCurrentInterest(e.target.value)}
            className={styles.input}
            placeholder="ex) AI, environment, healthcare, animals..."
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>How excited are you about this? <br/> (Slide: 1 = a little, 10 = super excited) <br/>{currentLevel}/10</label>
          <input
            type="range"
            min="1"
            max="10"
            value={currentLevel}
            onChange={(e) => setCurrentLevel(parseInt(e.target.value))}
            className={styles.slider}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Who do you hope your project will help or reach? (Choose one)</label>
          <select
            value={socialImpact}
            onChange={(e) => setSocialImpact(e.target.value)}
            className={styles.select}
            disabled={loading}
            defaultValue={"None"}
            >
            <option value="None">Please Select</option>
            <option value="self">Self</option>
            <option value="family">Family</option>
            <option value="friends">Friends</option>
            <option value="class">Class</option>
            <option value="school">School</option>
            <option value="community">Community</option>
            <option value="city">City</option>
            <option value="country">Country</option>
            <option value="world">World</option>
          </select>
        </div>

        <button
          onClick={handleAddInterest}
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add interest'}
        </button>
{/* 
        등록된 데이터 현황
        {(students.length > 0 || interests.length > 0) && (
          <div className={styles.studentList}>
            <p className={styles.formTitle}>Board</p>
            <p className={styles.label}>👥 Registered students: {students.length}</p>
            <p className={styles.label}>💡 Added interests: {interests.length}</p>
            
            {students.map((student) => {
              const studentInterests = interests.filter(
                interest => interest.studentId === student.id
              );
              return (
                <div key={student.id} className={styles.studentItem}>
                  <div
                    className={styles.colorDot}
                    style={{ backgroundColor: student.studentColor || '#999' }}
                  ></div>
                  <span>
                    {student.user.name} (interests: {studentInterests.length})
                  </span>
                </div>
              );
            })}
          </div>
        )} */}
      </div>

      {/* Cluster Analysis Result */}
      {getClusterAnalysis().length > 0 && (
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 20%)',
          borderRadius: '0.5rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#92400e' }}>🎯 Cluster Analysis Result</h3>
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
        </div>
        
      )}
    </div>
    </>
  );
};

export default InterestVisualization;