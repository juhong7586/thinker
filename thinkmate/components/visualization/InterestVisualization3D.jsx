import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from '../../styles/InterestForm.module.css';
import { api } from '../../utils/api';


const InterestVisualization = () => {
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
  
  const mountRef = useRef();
  const sceneRef = useRef();
  const rendererRef = useRef();
  const cameraRef = useRef();

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFB347'];

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  // 3D 시각화 초기화
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene 설정
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f8ff);
    sceneRef.current = scene;

    // Camera 설정
    const camera = new THREE.PerspectiveCamera(40, 800 / 400, 0.1, 1000);
    camera.position.set(150,150,150);
    cameraRef.current = camera;

    // Renderer 설정
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(800, 400);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 기존 canvas 제거 후 새로 추가
    if (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    mountRef.current.appendChild(renderer.domElement);

    // 조명 설정
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 100);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // 마우스 컨트롤
    let isMouseDown = false;
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    let cameraDistance = 300;

    const onMouseDown = (event) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onMouseMove = (event) => {
      if (!isMouseDown) return;
      
      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;
      
      targetX += deltaX * 0.01;
      targetY += deltaY * 0.01;

      targetY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetY));
      
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const onWheel = (event) => {
        event.preventDefault();
        cameraDistance *= (event.deltaY > 0 ? 1.1 : 0.9);
        cameraDistance = Math.max(100, Math.min(800, cameraDistance)); 
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('wheel', onWheel);

    // 애니메이션 루프
    const animate = () => {
      requestAnimationFrame(animate);
      
      // 카메라 회전
      camera.position.x = Math.cos(targetX) * Math.cos(targetY) * cameraDistance;
      camera.position.y = Math.sin(targetY) * cameraDistance;
      camera.position.z = Math.sin(targetX) * Math.cos(targetY) * cameraDistance;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // 관심사 데이터가 변경될 때마다 3D 시각화 업데이트
  useEffect(() => {
    if (!sceneRef.current || interests.length === 0) return;
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

  // 클러스터링 및 3D 시각화 업데이트
  const updateVisualization = () => {

    const scene = sceneRef.current;
    if (!scene) return;

    console.log('Updating visualization with interests:', interests);
    console.log('Current students:', students);

    if (interests.length === 0) {
        console.log('No interests to visualize.');
        return;
    }

    // 기존 객체들 제거
    const objectsToRemove = [];
    scene.traverse((child) => {
      if (child.userData.type === 'interest') {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach(obj => scene.remove(obj));

    // 관심사별 클러스터 생성
    const clusterMap = {};
    interests.forEach(interest => {
      const field = interest.field.toLowerCase();
      if (!clusterMap[field]) {
        clusterMap[field] = {
          field: interest.field,
          items: [],
          center: {
            x: (Math.random() - 0.5) * 200,
            y: (Math.random() - 0.5) * 200,
            z: (Math.random() - 0.5) * 200
          }
        };
      }
      clusterMap[field].items.push(interest);
    });

    const newClusters = Object.values(clusterMap);
    setClusters(newClusters);

    // 각 클러스터 시각화
    newClusters.forEach((cluster, clusterIndex) => {
      // 클러스터별로 원형 배치
      cluster.items.forEach((interest, index) => {
        const angle = (index / cluster.items.length) * Math.PI * 2;
        const radius = Math.min(cluster.items.length * 15, 60);
        
        // 위치 계산
        const x = cluster.center.x + Math.cos(angle) * radius + (Math.random() - 0.5) * 20;
        const y = cluster.center.y + Math.sin(angle) * radius + (Math.random() - 0.5) * 20;
        
        // Z축은 사회적 영향도에 따라
        let zOffset = 0;
        if (interest.socialImpact === 'HIGH') zOffset = 80;
        else if (interest.socialImpact === 'MODERATE') zOffset = 0;
        else zOffset = -80;
        
        const z = cluster.center.z + zOffset + (Math.random() - 0.5) * 30;

        // 학생 색상 찾기
        const student = students.find(s => s.id === interest.studentId);
        const studentColor = student ? colors[student.id % colors.length] : '#999';

        // 구 생성
        const sphereRadius = Math.max(interest.level * 1.5, 2);
        const geometry = new THREE.SphereGeometry(sphereRadius, 16, 16);
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color(studentColor),
          shininess: 400
        });

        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(x, y, z);
        sphere.userData = {
          type: 'interest',
          studentName: student ? student.user.name : 'Unknown',
          field: interest.field,
          level: interest.level,
          socialImpact: interest.socialImpact
        };
        
        scene.add(sphere);

        // 텍스트 라벨
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        context.fillStyle = 'rgba(255, 255, 255, 0.95)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#333';
        context.font = ' bold 64px Arial';
        context.textAlign = 'center';
        context.fillText(interest.field, canvas.width/2, 45);
        context.fillText(`${student ? student.user.name : 'Unknown'}`, canvas.width / 2, 105);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(x, y + sphereRadius + 5, z);
        sprite.scale.set(40, 10, 1);
        sprite.userData.type = 'interest';
        scene.add(sprite);
      });

      // 클러스터 경계 (2개 이상일 때만)
      if (cluster.items.length > 1) {
        const boundingRadius = Math.max(cluster.items.length * 12, 60);
        const boundingGeometry = new THREE.SphereGeometry(boundingRadius, 16, 16);
        const boundingMaterial = new THREE.MeshBasicMaterial({
          color: 0x87CEEB,
          transparent: true,
          opacity: 0.1,
          wireframe: true
        });
        const boundingSphere = new THREE.Mesh(boundingGeometry, boundingMaterial);
        boundingSphere.position.set(cluster.center.x, cluster.center.y, cluster.center.z);
        boundingSphere.userData.type = 'interest';
        scene.add(boundingSphere);

        // 클러스터 라벨
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        context.fillStyle = 'rgba(255, 215, 0, 0.9)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#8B4513';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.fillText(`${cluster.field}`, canvas.width / 2, 60);
        context.font = '40px Arial';
        context.fillText(`Number: ${cluster.items.length}`, canvas.width / 2, 100);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(cluster.center.x, cluster.center.y + boundingRadius + 40, cluster.center.z);
        sprite.scale.set(80, 20, 1);
        sprite.userData.type = 'interest';
        scene.add(sprite);
      }
    });
  };

  const handleCreateStudent = async () => {
    if (!currentStudent.trim() || !currentEmail.trim()) {
      alert('Write your name and email please.');
      return;
    }

    setLoading(true);
    try {
      await api.createStudent(currentStudent, currentEmail);
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
      {/* 학생 등록 패널 */}
      <div className={styles.transparentBox}>
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

      {/* 3D 시각화 패널 */}
      <div className={styles.formPanel}>
        <h2 className={styles.formTitle}>3D Interest Cluster 🚀</h2>
        <div 
          ref={mountRef}
          style={{ 
            width: '100%', 
            height: '400px', 
            border: '2px solid #e5e7eb', 
            borderRadius: '0.5rem',
            background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)',
            overflow: 'hidden'
          }}
        />
        
        <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
          <p>🖱️ Drag: Rotate | 🔄 Wheel: Zoom In/Out | 📊 Z axis: Desired Social Impact (UP=High, DOWN=Low)</p>
          <p>⚫ Sphere Size: Interest Level | 🎨 Color: Each Student</p>
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