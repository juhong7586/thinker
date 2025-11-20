import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import styles from '../../styles/InterestForm.module.css';
import homeStyles from '../../styles/Home.module.css';
import { api } from '../../utils/api';
import {computeVisualizationNodes, interestStats} from '../../utils/visualizationData';

const InterestVisualizationPlotly = dynamic(() => import('./InterestVisualizationPlotly'), { ssr: false });


const InterestVisualization = ({ width: propWidth, height: propHeight, signedUser, selectedGroup, aiResult }) => {
  const [students, setStudents] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clusters, setClusters] = useState([]);
  const [memberIds, setMemberIds] = useState(null);
  
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
  
  // nodes passed to Plotly (memoized)

  // draggable register panel state
  const panelRef = useRef(null);
  const draggingRef = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState({ left: null, top: null });
  const [isDragging, setIsDragging] = useState(false);

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFB347'];
  
  // stable load function with in-flight guard
  const loadingRef = useRef(false);
  const loadData = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const [studentsData, interestsData] = await Promise.all([
        api.getStudents(),
        api.getInterests(),
      ]);
      console.log('✅ Loaded students:', studentsData);
      console.log('✅ Loaded interests:', interestsData);
      setStudents(studentsData);
      setInterests(interestsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      // surface a user-friendly message only once
      if (!window.__thinkmate_notified) {
        window.__thinkmate_notified = true;
        alert('Fail to load data.');
      }
    } finally {
      loadingRef.current = false;
    }
  }, []);

  // load data on mount
  useEffect(() => { loadData(); }, [loadData]);

  // load saved panel position from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('thinkmate_register_pos');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.left === 'number' && typeof parsed.top === 'number') {
          setPosition({ left: parsed.left, top: parsed.top });
        }
      } else {
        // default position: 20px from right, 20px from top
        setPosition({ right: '2rem', top: 20 });
      }
    } catch (e) {
      setPosition({ right: '2rem', top: 20 });
    }
  }, []);

  // helper to clamp position inside the viewport using panel size
  const clampToViewport = (left, top) => {
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const rect = panelRef.current ? panelRef.current.getBoundingClientRect() : { width: 360, height: 240 };
    const maxLeft = Math.max(0, winW - rect.width - 8);
    const maxTop = Math.max(8, winH - rect.height - 8);
    const clampedLeft = Math.min(Math.max(0, left), maxLeft);
    const clampedTop = Math.min(Math.max(8, top), maxTop);
    return { left: clampedLeft, top: clampedTop };
  };

  // pointer/mouse/touch handlers for dragging
  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    let clientX, clientY;
    if (e.type === 'touchmove') {
      if (!e.touches || e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const newLeft = clientX - dragOffset.current.x;
    const newTop = clientY - dragOffset.current.y;
    const clamped = clampToViewport(newLeft, newTop);
    setPosition(clamped);
  };

  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    // remove global listeners
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('mouseup', onPointerUp);
    window.removeEventListener('touchmove', onPointerMove);
    window.removeEventListener('touchend', onPointerUp);
    // persist position
    try {
      localStorage.setItem('thinkmate_register_pos', JSON.stringify(position));
    } catch (e) {
      // ignore
    }
  };

  const onPointerDown = (e) => {
    // only start dragging when left mouse button or touch
    if (e.type === 'mousedown' && e.button !== 0) return;
    draggingRef.current = true;
    setIsDragging(true);
    const rect = panelRef.current ? panelRef.current.getBoundingClientRect() : { left: 0, top: 0 };
    let clientX = e.clientX, clientY = e.clientY;
    if (e.type === 'touchstart') {
      if (!e.touches || e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }
    dragOffset.current = { x: clientX - rect.left, y: clientY - rect.top };
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
    };
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

  // memoize computed visualization nodes to avoid re-computation on unrelated renders
  const nodes = useMemo(() => {
    const activeInterests = (selectedGroup && memberIds) ? interests.filter(i => memberIds.has(i.studentId)) : interests;
    if (!activeInterests || activeInterests.length === 0) return [];
    const padding = 10;
    const width = propWidth;
    const height = propHeight;
    const groupResults = interestStats(activeInterests);
    return computeVisualizationNodes(groupResults, students, { width, height, padding, colors });
  }, [interests, students, propWidth, propHeight, selectedGroup, memberIds]);


  // when selectedGroup changes, fetch its members so we can filter interests
  useEffect(() => {
    let mounted = true;
    if (!selectedGroup) {
      setMemberIds(null);
      return () => { mounted = false };
    }

    const fetchMembers = async () => {
      try {
        const res = await fetch(`/api/groups/${selectedGroup.id}/members`);
        if (!res.ok) throw new Error('failed to load members');
        const data = await res.json();
        const ids = new Set((data.members || []).map(m => m.studentId).filter(Boolean));
        if (mounted) setMemberIds(ids);
      } catch (err) {
        console.error('Could not load group members', err);
        if (mounted) setMemberIds(new Set());
      }
    };

    fetchMembers();
    return () => { mounted = false };
  }, [selectedGroup]);

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
      // refresh list
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
      alert('Login before adding an interest.');
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
      await api.createInterest(selectedStudentId, currentInterest, currentLevel, socialImpact);
      setCurrentInterest('');
      // refresh list
      await loadData();
      alert('Added interest!');
    } catch (error) {
      console.error('Failed to add interest:', error);
      alert('Failed to add interest.');
    } finally {
      setLoading(false);
    }
  };


  const clusterAnalysis = useMemo(() => {
    return clusters.filter(cluster => cluster.items.length > 1).map(cluster => {
      const avgLevel = (cluster.items.reduce((sum, item) => sum + item.level, 0) / cluster.items.length).toFixed(1);
      const studentNames = cluster.items.map(item => {
        const student = students.find(s => s.id === item.studentId);
        return student ? student.user.name : 'Unknown';
      });
      return { field: cluster.field, memberCount: cluster.items.length, students: studentNames, avgLevel };
    });
  }, [clusters, students]);


  return (
    <>
      
      <div className={homeStyles.fullScreenBox}>

  <InterestVisualizationPlotly width={propWidth} height={propHeight} nodes={nodes} aiResult={aiResult} />

      {/* Register own interests (draggable) */}
      <div
        id="register"
        ref={panelRef}
        className={styles.formPanel}
        style={{
          position: 'fixed',
          
          left: typeof position.left === 'number' ? `${position.left}px` : undefined,
          top: typeof position.top === 'number' ? `${position.top}px` : undefined,
          zIndex: 1200,
          cursor: isDragging ? 'grabbing' : 'default',
          touchAction: ' none'
        }}
      >
        <div
          onMouseDown={onPointerDown}
          onTouchStart={onPointerDown}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: isDragging ? 'grabbing' : 'default', paddingBottom: '0.5rem' }}
        >
          <h2 className={styles.formTitle} style={{ margin: 0 }}>Add Interest</h2>
          <div style={{ fontSize: '0.9rem', color: '#666', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}>{isDragging ? 'Dragging...' : 'Drag to move'}</div>
        </div>
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
  {clusterAnalysis.length > 0 && (
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 20%)',
          borderRadius: '0.5rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#92400e' }}>🎯 Cluster Analysis Result</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {clusterAnalysis.map((cluster, index) => (
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