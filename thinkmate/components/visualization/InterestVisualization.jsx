import React, { useState, useEffect, useRef } from 'react';
import styles from '../../styles/InterestForm.module.css';
import homeStyles from '../../styles/Home.module.css';
import { api } from '../../utils/api';
import * as d3 from 'd3';
import {computeVisualizationNodes, interestStats} from '../../utils/visualizationData';


const InterestVisualization = ({ width: propWidth, height: propHeight }) => {
  const [students, setStudents] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clusters, setClusters] = useState([]);
  
  // 폼 상태
  const [currentStudent, setCurrentStudent] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [currentInterest, setCurrentInterest] = useState('');
  const [currentLevel, setCurrentLevel] = useState(5);
  const [socialImpact, setSocialImpact] = useState('moderate');
  const [currentColor, setCurrentColor] = useState('#FF6B6B');
  
  const svgRef = useRef();

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFB347'];
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

   // 관심사 데이터가 변경될 때마다 시각화 업데이트
  useEffect(() => {
    if (!svgRef.current || interests.length === 0) return;
    updateVisualization();
  }, [interests, students]);

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

  // 클러스터링 및 시각화 업데이트
  const updateVisualization = (width = propWidth, height = propHeight) => {    
    if (!svgRef.current) return;
    if (!interests || interests.length === 0) return;
    
    const svgNode = svgRef.current;
    const padding = 40;


    const svg = d3.select(svgNode);
    svg.attr('width', width).attr('height', height);

    const groupResults = interestStats(interests);

    // compute nodes (positions, radius, color) from helper
    const nodes = computeVisualizationNodes(groupResults, students, { width, height, padding, colors });

    // Data join with stable keys using precomputed node positions
    const groups = svg.selectAll('g.circle-group').data(nodes, d => d.id);

    // EXIT
    groups.exit().transition().duration(300).style('opacity', 0).remove();

    // ENTER
    const enter = groups.enter()
      .append('g')
      .attr('class', 'circle-group');

    // create circle and label using the precomputed positions
    enter.append('circle')
      .attr('class', 'circle')
      .attr('cx', d => d._x)
      .attr('cy', d => d._y)
      .attr('r', 0)
      .attr('fill', 'purple')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('opacity', 0);

    // MERGE + UPDATE
    const merged = enter.merge(groups);

    merged.select('circle').transition().duration(350)
      .style('opacity', 0.6)
      .attr('cx', d => d._x)
      .attr('cy', d => d._y)
      .attr('r', d => d._r * 1.3)
      .attr('fill', d => colors[d.id % colors.length] || 'purple');

    // optional: add labels on enter
    enter.append('text')
      .attr('class', 'label')
      .attr('x', d => d._x)
      .attr('y', d => d._y)
      .text(d => d.field || '');

    // update text positions
    merged.select('text.label').transition().duration(350)
      .attr('x', d => d._x)
      .attr('y', d => d._y)
      .attr('font-size', 17)

      .attr('text-anchor', 'middle')
      .attr('fill', '#222')
      .text(d => d.field || '');

  }

  const handleCreateStudent = async () => {
    if (!currentStudent.trim() || !currentEmail.trim()) {
      alert('Write your name and email please.');
      return;
    }

    setLoading(true);
    try {
      await api.createStudent(currentStudent, currentEmail, currentColor);
      setCurrentStudent('');
      setCurrentEmail('');
      setCurrentColor('');
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
    if (!selectedStudentId || !currentInterest.trim()) {
      alert('Select student first.');
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
      console.log()
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
      
      <svg id="graph" ref={svgRef} style={{ width: '100%', height: '100%'}} />

      {/* 학생 등록 패널 */}
      <div id="register" className={styles.formPanel} >
        <h2 className={styles.formTitle}>1. Register</h2>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>NAME</label>
          <input
            type="text"
            value={currentStudent}
            onChange={(e) => setCurrentStudent(e.target.value)}
            className={styles.input}
            placeholder="Write your name"
            disabled={loading}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>EMAIL</label>
          <input
            type="email"
            value={currentEmail}
            onChange={(e) => setCurrentEmail(e.target.value)}
            className={styles.input}
            placeholder="abcd@example.com"
            disabled={loading}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>색상 선택 (선택사항)</label>
          <input 
          type="color" 
          id="colorInput" 
          value={currentColor}
          onChange={(e) => setCurrentColor(e.target.value)}
          />
        </div>

        <button
          onClick={handleCreateStudent}
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'register student'}
        </button>

        <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

        <h2 className={styles.formTitle}>2. Add Interest</h2>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>select student</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className={styles.select}
            disabled={loading}
          >
            <option value="">Select student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.user.name} ({student.user.email})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>topic</label>
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
          <label className={styles.label}>How much?: {currentLevel}/10</label>
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
          <label className={styles.label}>Desired Social Impact</label>
          <select
            value={socialImpact}
            onChange={(e) => setSocialImpact(e.target.value)}
            className={styles.select}
            disabled={loading}
          >
            <option value="low">Low</option>
            <option value="moderate">Middle</option>
            <option value="high">High</option>
          </select>
        </div>

        <button
          onClick={handleAddInterest}
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add interest'}
        </button>

        {/* 등록된 데이터 현황 */}
        {(students.length > 0 || interests.length > 0) && (
          <div className={styles.studentList}>
            <h3>Board</h3>
            <p>👥 Registered students: {students.length}</p>
            <p>💡 Added interests: {interests.length}</p>
            
            {students.map((student) => {
              const studentInterests = interests.filter(
                interest => interest.studentId === student.id
              );
              return (
                <div key={student.id} className={styles.studentItem}>
                  <div
                    className={styles.colorDot}
                    style={{ backgroundColor: colors[student.id % colors.length] }}
                  ></div>
                  <span>
                    {student.user.name} (interests: {studentInterests.length})
                  </span>
                </div>
              );
            })}
          </div>
        )}
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