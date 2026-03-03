import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const ParticleScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const linesRef = useRef<THREE.LineSegments | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const [currentSection, setCurrentSection] = useState('home');
  const raycasterRef = useRef(new THREE.Raycaster());
  const textModeRef = useRef(false);
  const textPositionsRef = useRef<THREE.Vector3[]>([]);
  const currentModelRef = useRef<THREE.Mesh | null>(null);
  const modelAnimationDataRef = useRef<{
    type: string;
    startTime: number;
  }>({ type: 'home', startTime: 0 });

  const projects = [
    { id: 1, name: 'Project 1', description: 'Web App' },
    { id: 2, name: 'Project 2', description: 'Mobile App' },
    { id: 3, name: 'Project 3', description: '3D Visualization' },
  ];

  // Generate particles in text formation
  const getTextParticles = (text: string, spacing = 5) => {
    const positions: THREE.Vector3[] = [];
    const charWidth = 8;
    const startX = -(text.length * charWidth) / 2;

    for (let i = 0; i < text.length; i++) {
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 6; col++) {
          positions.push(
            new THREE.Vector3(
              startX + i * charWidth + col * spacing - 15,
              20 - row * spacing,
              0
            )
          );
        }
      }
    }
    return positions;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    sceneRef.current = scene;

    // Camera setup
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 50;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create particles (reduce count on smaller / touch devices)
    let particleCount = 1000;
    const isTouch = 'maxTouchPoints' in navigator && navigator.maxTouchPoints > 0;
    const widthCheck = containerRef.current ? containerRef.current.clientWidth : window.innerWidth;
    if (isTouch || widthCheck < 600) {
      particleCount = 400;
    } else if (widthCheck < 1000) {
      particleCount = 700;
    }

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const targetPositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 80;
      positions[i + 1] = (Math.random() - 0.5) * 80;
      positions[i + 2] = (Math.random() - 0.5) * 80;

      velocities[i] = (Math.random() - 0.5) * 0.2;
      velocities[i + 1] = (Math.random() - 0.5) * 0.2;
      velocities[i + 2] = (Math.random() - 0.5) * 0.2;

      targetPositions[i] = positions[i];
      targetPositions[i + 1] = positions[i + 1];
      targetPositions[i + 2] = positions[i + 2];
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targetPositions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x0ea5e9,
      size: 0.5,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // STEP 1: Create particle connections (lines)
    const lineGeometry = new THREE.BufferGeometry();
    // reduce connection distance when fewer particles present
    const connectDistance = particleCount < 600 ? 20 : 15;

    const updateConnections = () => {
      const linePositions: number[] = [];
      const lineIndices: number[] = [];
      const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
      const positions = positionAttribute.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = positions[j * 3] - positions[i * 3];
          const dy = positions[j * 3 + 1] - positions[i * 3 + 1];
          const dz = positions[j * 3 + 2] - positions[i * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < connectDistance) {
            linePositions.push(
              positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
              positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
            );
          }
        }
      }

      lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
      lineGeometry.computeBoundingSphere();
    };

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.2,
      linewidth: 1,
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);
    linesRef.current = lines;

    // Mouse movement
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      targetRotationRef.current.y = mouseRef.current.x * 0.3;
      targetRotationRef.current.x = mouseRef.current.y * 0.3;
    };

    // STEP 5: Click handling for interactivity and particle explosions
    const handleClick = (x: number, y: number) => {
      const mouse = new THREE.Vector2(
        (x / window.innerWidth) * 2 - 1,
        -(y / window.innerHeight) * 2 + 1
      );

      raycasterRef.current.setFromCamera(mouse, camera);
      const intersects = raycasterRef.current.intersectObject(particles);

      if (intersects.length > 0) {
        // Particle explosion effect
        const velocityAttribute = geometry.getAttribute('velocity') as THREE.BufferAttribute;
        const particleVelocities = velocityAttribute.array as Float32Array;

        for (let i = 0; i < Math.min(80, particleCount); i++) {
          const idx = Math.floor(Math.random() * particleCount);
          const vx = (Math.random() - 0.5) * 2;
          const vy = (Math.random() - 0.5) * 2;
          const vz = (Math.random() - 0.5) * 2;

          particleVelocities[idx * 3] = vx;
          particleVelocities[idx * 3 + 1] = vy;
          particleVelocities[idx * 3 + 2] = vz;
        }

        velocityAttribute.needsUpdate = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', e => handleClick(e.clientX, e.clientY));
    window.addEventListener('touchstart', e => {
      if (e.touches.length > 0) {
        handleClick(e.touches[0].clientX, e.touches[0].clientY);
      }
    });

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // STEP 2: Text formation animation
    const switchToTextMode = (text: string) => {
      if (textModeRef.current && textPositionsRef.current.length > 0) {
        textModeRef.current = false;
        textPositionsRef.current.length = 0;
        return;
      }

      textModeRef.current = true;
      const newTextPositions = getTextParticles(text);
      textPositionsRef.current = newTextPositions;

      const targetAttribute = geometry.getAttribute('targetPosition') as THREE.BufferAttribute;
      const targets = targetAttribute.array as Float32Array;

      for (let i = 0; i < Math.min(textPositionsRef.current.length, particleCount); i++) {
        targets[i * 3] = textPositionsRef.current[i].x;
        targets[i * 3 + 1] = textPositionsRef.current[i].y;
        targets[i * 3 + 2] = textPositionsRef.current[i].z;
      }

      targetAttribute.needsUpdate = true;
    };

    // Create procedural 3D geometry based on section
    const createSectionGeometry = (section: string): THREE.Mesh => {
      let geometry: THREE.BufferGeometry;
      let material: THREE.Material;

      const baseMaterial = new THREE.MeshPhongMaterial({
        color: 0x0ea5e9,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.3,
        wireframe: false,
      });

      switch (section) {
        case 'home':
          // Spinning icosahedron
          geometry = new THREE.IcosahedronGeometry(8, 4);
          break;
        case 'about':
          // Floating torus
          geometry = new THREE.TorusGeometry(8, 3, 16, 100);
          break;
        case 'projects':
          // Grid of boxes
          geometry = new THREE.BoxGeometry(4, 4, 4);
          break;
        case 'skills':
          // Octahedron (pyramid-like)
          geometry = new THREE.OctahedronGeometry(8, 2);
          break;
        case 'contact':
          // Morphing sphere
          geometry = new THREE.IcosahedronGeometry(8, 5);
          break;
        default:
          geometry = new THREE.SphereGeometry(8, 32, 32);
      }

      const mesh = new THREE.Mesh(geometry, baseMaterial);
      mesh.position.set(0, -8, 0);
      mesh.scale.set(1.2, 1.2, 1.2);

      return mesh;
    };

    // Replace or create model for section
    const switchToSectionModel = (section: string) => {
      if (sceneRef.current && currentModelRef.current) {
        sceneRef.current.remove(currentModelRef.current);
      }

      const newModel = createSectionGeometry(section);
      sceneRef.current?.add(newModel);
      currentModelRef.current = newModel;
      modelAnimationDataRef.current = {
        type: section,
        startTime: Date.now(),
      };
    };

    // STEPS 3 & 4: Section switching and project showcase
    const handleSectionChange = (section: string) => {
      setCurrentSection(section);

      switch (section) {
        case 'home':
          textModeRef.current = false;
          textPositionsRef.current.length = 0;
          switchToSectionModel('home');
          break;
        case 'about':
          switchToTextMode('ABOUT');
          switchToSectionModel('about');
          break;
        case 'projects':
          switchToTextMode('WORK');
          switchToSectionModel('projects');
          break;
        case 'skills':
          switchToTextMode('SKILLS');
          switchToSectionModel('skills');
          break;
        case 'contact':
          switchToTextMode('CONTACT');
          switchToSectionModel('contact');
          break;
      }
    };

    // Expose section handler to window for UI buttons
    (window as any).particleSceneHandler = handleSectionChange;

    // initially load home geometry
    switchToSectionModel('home');

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Smooth rotation towards target
      if (particles) {
        particles.rotation.x += (targetRotationRef.current.x - particles.rotation.x) * 0.1;
        particles.rotation.y += (targetRotationRef.current.y - particles.rotation.y) * 0.1;
      }

      // rotate current model if present
      if (currentModelRef.current) {
        currentModelRef.current.rotation.y += 0.005;
        currentModelRef.current.rotation.x += 0.002;
        
        // Apply section-specific animations
        const elapsed = Date.now() - modelAnimationDataRef.current.startTime;
        const time = elapsed * 0.001;
        
        switch (modelAnimationDataRef.current.type) {
          case 'home':
            currentModelRef.current.scale.z = 1 + Math.sin(time * 0.5) * 0.2;
            break;
          case 'about':
            currentModelRef.current.position.y = Math.sin(time) * 5;
            break;
          case 'projects':
            currentModelRef.current.rotation.z += 0.01;
            break;
          case 'skills':
            const scale = 1 + Math.sin(time * 1.5) * 0.3;
            currentModelRef.current.scale.set(scale, scale, scale);
            break;
          case 'contact':
            if (currentModelRef.current.geometry instanceof THREE.IcosahedronGeometry) {
              const positions = (currentModelRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
              for (let i = 0; i < positions.length; i += 3) {
                positions[i] += Math.sin(time + i) * 0.001;
              }
              (currentModelRef.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
            }
            break;
        }
      }

      // Update particle positions
      const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
      const velocityAttribute = geometry.getAttribute('velocity') as THREE.BufferAttribute;
      const targetAttribute = geometry.getAttribute('targetPosition') as THREE.BufferAttribute;

      const positions = positionAttribute.array as Float32Array;
      const velocities = velocityAttribute.array as Float32Array;
      const targets = targetAttribute.array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        // Move towards target position (text formation)
        if (textModeRef.current && textPositionsRef.current.length > 0) {
          const particleIdx = i / 3;
          const targetIdx = Math.min(particleIdx, textPositionsRef.current.length - 1);
          targets[i] = textPositionsRef.current[targetIdx].x;
          targets[i + 1] = textPositionsRef.current[targetIdx].y;
          targets[i + 2] = textPositionsRef.current[targetIdx].z;
        }

        // Smoothly move towards target
        const dx = targets[i] - positions[i];
        const dy = targets[i + 1] - positions[i + 1];
        const dz = targets[i + 2] - positions[i + 2];

        positions[i] += dx * 0.02 + velocities[i];
        positions[i + 1] += dy * 0.02 + velocities[i + 1];
        positions[i + 2] += dz * 0.02 + velocities[i + 2];

        // Apply damping to velocities
        velocities[i] *= 0.98;
        velocities[i + 1] *= 0.98;
        velocities[i + 2] *= 0.98;

        // Bounce off boundaries
        if (positions[i] > 40 || positions[i] < -40) velocities[i] *= -1;
        if (positions[i + 1] > 40 || positions[i + 1] < -40) velocities[i + 1] *= -1;
        if (positions[i + 2] > 40 || positions[i + 2] < -40) velocities[i + 2] *= -1;
      }

      positionAttribute.needsUpdate = true;
      targetAttribute.needsUpdate = true;

      // Update connections every other frame for performance
      if (Math.random() > 0.8) {
        updateConnections();
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      delete (window as any).particleSceneHandler;
      geometry.dispose();
      lineGeometry.dispose();
      material.dispose();
      lineMaterial.dispose();
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,
      }}
    />
  );
};

export default ParticleScene;
