import { useEffect, useRef } from 'react';
import { Renderer, Camera, Geometry, Program, Mesh } from 'ogl';

export default function ConvergingParticles({ studentNum }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ depth: false, alpha: true });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, 20);

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };
    window.addEventListener('resize', resize, false);
    resize();

    const vertex = /* glsl */ `
      attribute vec3 position;
      attribute vec4 random;
      attribute vec3 color;
      
      uniform mat4 modelMatrix;
      uniform mat4 viewMatrix;
      uniform mat4 projectionMatrix;
      uniform float uTime;
      uniform float uSpread;
      uniform float uBaseSize;
      uniform float uConvergence;
      
      varying vec4 vRandom;
      varying vec3 vColor;
      varying float vGlow;
      
      void main() {
        vRandom = random;
        vColor = color;
        
        vec3 pos = position * uSpread;
        pos.z *= 10.0;
        
        vec4 mPos = modelMatrix * vec4(pos, 1.0);
        
        // Convergence towards center bottom
        mPos.x *= (1.0 - uConvergence * 0.9);
        mPos.y = mix(mPos.y, -8.0, uConvergence);
        mPos.z *= (1.0 - uConvergence * 0.5);
        
        vec4 mvPos = viewMatrix * mPos;
        
        float sizeAtConvergence = mix(uBaseSize, uBaseSize * 3.0, uConvergence);
        gl_PointSize = sizeAtConvergence / length(mvPos.xyz);
        
        vGlow = uConvergence;
        gl_Position = projectionMatrix * mvPos;
      }
    `;

    const fragment = /* glsl */ `
      precision highp float;
      
      uniform float uTime;
      varying vec4 vRandom;
      varying vec3 vColor;
      varying float vGlow;
      
      void main() {
        vec2 uv = gl_PointCoord.xy;
        float d = length(uv - vec2(0.5));
        
        float circle = smoothstep(0.5, 0.3, d);
        float glow = smoothstep(0.6, 0.0, d) * vGlow;
        
        gl_FragColor = vec4(vColor + vec3(glow * 0.5), circle + glow * 0.6);
      }
    `;

    const count = studentNum || 0;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Particles start from top
      let x, y, z, len;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        len = x * x + y * y + z * z;
      } while (len > 1 || len === 0);
      
      // Bias towards top
      y = Math.abs(y) * 1.5;
      
      const r = Math.cbrt(Math.random());
      positions.set([x * r, y * r, z * r], i * 3);
      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      
      const hue = Math.random();
      const color = hue < 0.5 
        ? [1, 1, 1] 
        : [0.4 + Math.random() * 0.3, 0.7 + Math.random() * 0.3, 1];
      colors.set(color, i * 3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors }
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: 10 },
        uBaseSize: { value: 80 },
        uConvergence: { value: 0 }
      },
      transparent: true,
      depthTest: false
    });

    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

    let animationFrameId;
    let convergence = 0;
    const convergenceSpeed = 0.001;
    const resetThreshold = 12;

    const update = () => {
      animationFrameId = requestAnimationFrame(update);
      
      // Loop: increase convergence, reset when complete
      convergence += convergenceSpeed;
      if (convergence > resetThreshold) {
        convergence = 0;
      }
      
      program.uniforms.uConvergence.value = Math.min(convergence, 1);

      renderer.render({ scene: particles, camera });
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        background: 'linear-gradient(180deg, #ffffff 30%, #020202 70%)'
      }}
    />
  );
}