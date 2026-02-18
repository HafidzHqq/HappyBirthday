import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const PARTICLE_COUNT = 5000;
const PATTERNS = {
  SPHERE: 'sphere',
  HEART: 'heart',
  CAKE: 'cake',
  RING: 'ring',
  RANDOM: 'random',
};

export default function HandParticleSystem() {
  const mountRef = useRef(null);
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [gesture, setGesture] = useState('NONE'); // NONE, OPEN, CLOSED
  const [activePattern, setActivePattern] = useState(PATTERNS.SPHERE);
  const [particleColor, setParticleColor] = useState('#00ffff');
  
  // Refs for animation loop access without re-renders
  const sceneRef = useRef(null);
  const particlesRef = useRef(null);
  const targetPositionsRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const gestureRef = useRef('NONE');
  const handPositionRef = useRef({ x: 0.5, y: 0.5 }); // New ref for hand position
  const frameIdRef = useRef(null);
  const animateRef = useRef(null);

  const lastVideoTimeRef = useRef(-1);

  const predictWebcam = () => {
    // Schedule next frame FIRST to keep loop alive
    frameIdRef.current = window.requestAnimationFrame(predictWebcam);

    if (!handLandmarkerRef.current || !videoRef.current) return;
    
    // Throttle: Only process if video has advanced and enough time passed (e.g. 30fps cap for heavy WASM)
    // Actually, detectForVideo is synchronous and heavy. Let's rely on browser natural throttling but add a safety check.
    const now = performance.now();
    
    if (videoRef.current && videoRef.current.readyState >= 2) {
      if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
         lastVideoTimeRef.current = videoRef.current.currentTime;
         try {
            const results = handLandmarkerRef.current.detectForVideo(videoRef.current, now);
            
            if (results.landmarks && results.landmarks.length > 0) {
                const landmarks = results.landmarks[0];
                const wrist = landmarks[0];
                
                // Store wrist position for rotation control
                // Flip X because webcam is usually mirrored
                handPositionRef.current = { 
                    x: 1 - wrist.x, 
                    y: wrist.y 
                };

                const indexTip = landmarks[8];
                const middleTip = landmarks[12];
                const ringTip = landmarks[16];
                const pinkyTip = landmarks[20];
                
                const getDist = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
                const tips = [indexTip, middleTip, ringTip, pinkyTip];
                const avgDistToWrist = tips.reduce((acc, tip) => acc + getDist(tip, wrist), 0) / 4;
                
                // Debug log occasionally
                if (Math.random() < 0.05) {
                   console.log(`Hand Detected! AvgDist=${avgDistToWrist.toFixed(2)}`);
                }

                if (avgDistToWrist < 0.28) {
                     setGesture('CLOSED');
                     gestureRef.current = 'CLOSED';
                } else if (avgDistToWrist > 0.42) {
                     setGesture('OPEN');
                     gestureRef.current = 'OPEN';
                } else {
                     setGesture('NEUTRAL');
                     gestureRef.current = 'NEUTRAL';
                }
            } else {
                setGesture('NONE');
                gestureRef.current = 'NONE';
            }
          } catch (e) {
            console.error("Prediction error:", e);
          }
      }
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', () => {
             console.log("Video data loaded");
             videoRef.current.play();
             setIsLoaded(true);
             predictWebcam();
        });
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  // Setup MediaPipe
  useEffect(() => {
    async function setupMediaPipe() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "CPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        console.log("HandLandmarker created");
        startWebcam();
      } catch (error) {
        console.error("Error creating HandLandmarker:", error);
      }
    }

    setupMediaPipe();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
         videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Setup Three.js
  useEffect(() => {
    if (!mountRef.current) return;

    // SCENE
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // CAMERA
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';
    mountRef.current.appendChild(renderer.domElement);

    // PARTICLES
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    
    // Initial random positions
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 100;
      colors[i] = 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // Initialize targets
    targetPositionsRef.current = new Float32Array(PARTICLE_COUNT * 3);
    
    // Moved generatePattern logic inside useEffect or use a ref-stable version
    // But since generatePattern needs to be accessible outside, let's just copy the logic for initial setup
    // or rely on the second useEffect which runs right after.
    // However, the second useEffect depends on activePattern which doesn't change on mount.
    // Let's explicitly trigger it here to be safe.
    
    // We can't call generatePattern here comfortably if it's defined below as a const.
    // But the closure *should* capture it. 
    // To be absolutely safe and avoid closure staleness issues on HMR or weird mounting:
    
    // Initial Sphere Pattern
    const targets = targetPositionsRef.current;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;
        const r = 10;
        const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
        const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
        targets[ix] = r * Math.cos(theta) * Math.sin(phi);
        targets[iy] = r * Math.sin(theta) * Math.sin(phi);
        targets[iz] = r * Math.cos(phi);
    }

    // ANIMATION LOOP
    const animate = () => {
      animateRef.current = requestAnimationFrame(animate); 

      // Debug log (throttled)
      if (Math.random() < 0.01) {
          const firstPos = particlesRef.current ? particlesRef.current.geometry.attributes.position.array[0] : 'N/A';
          console.log(`Loop: Gesture=${gestureRef.current}, Pos[0]=${firstPos}, Target[0]=${targetPositionsRef.current ? targetPositionsRef.current[0] : 'N/A'}`);
      }

      if (particlesRef.current && targetPositionsRef.current) {
         const positions = particlesRef.current.geometry.attributes.position.array;
         const targets = targetPositionsRef.current;
         
         // Interaction Factor based on gesture
         let speed = 0.05;
         let expansionFactor = 1.0;
         
         if (gestureRef.current === 'CLOSED') {
             // Contract/Implode
             expansionFactor = 0.1;
             speed = 0.1;
         } else if (gestureRef.current === 'OPEN') {
             // Expand/Disperse slightly or maintain shape breathing
             expansionFactor = 1.5; // Explode out a bit
             speed = 0.08;
         } else {
             // Normal state
             expansionFactor = 1.0;
         }

         for (let i = 0; i < PARTICLE_COUNT; i++) {
             const ix = i * 3;
             const iy = i * 3 + 1;
             const iz = i * 3 + 2;

             // Calculate target with gesture influence
             // If CLOSED, target is (0,0,0) or scaled down version of target
             
             let tx, ty, tz;
             
             if (gestureRef.current === 'CLOSED') {
                 // Gravitate towards center strongly
                 tx = targets[ix] * 0.1;
                 ty = targets[iy] * 0.1;
                 tz = targets[iz] * 0.1;
             } else if (gestureRef.current === 'OPEN') {
                // Expand out from center
                 tx = targets[ix] * 1.5;
                 ty = targets[iy] * 1.5;
                 tz = targets[iz] * 1.5;
             } else {
                 tx = targets[ix];
                 ty = targets[iy];
                 tz = targets[iz];
             }

             // Lerp current position to target
             positions[ix] += (tx - positions[ix]) * speed;
             positions[iy] += (ty - positions[iy]) * speed;
             positions[iz] += (tz - positions[iz]) * speed;
         }
         
         particlesRef.current.geometry.attributes.position.needsUpdate = true;
         
         // Camera/Object Rotation Logic
         if (gestureRef.current !== 'NONE' && handPositionRef.current) {
             // Hand controls rotation
             const targetRotY = (handPositionRef.current.x - 0.5) * Math.PI * 2; // Full horizontal rotation
             const targetRotX = (handPositionRef.current.y - 0.5) * Math.PI * 0.5; // Tilt up/down
             
             // Smoothly interpolate current rotation to target rotation
             particlesRef.current.rotation.y += (targetRotY - particlesRef.current.rotation.y) * 0.1;
             particlesRef.current.rotation.x += (targetRotX - particlesRef.current.rotation.x) * 0.1;
         } else {
             // Auto-rotate if no hand detected
             particlesRef.current.rotation.y += 0.002;
             // Gently return X tilt to 0
             particlesRef.current.rotation.x += (0 - particlesRef.current.rotation.x) * 0.05;
         }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(frameIdRef.current);
        cancelAnimationFrame(animateRef.current);
        if (mountRef.current && renderer.domElement) {
            mountRef.current.removeChild(renderer.domElement);
        }
        geometry.dispose();
        material.dispose();
        renderer.dispose();
    };
  }, []);

  // Handle Pattern Changes
  useEffect(() => {
    generatePattern(activePattern);
  }, [activePattern]);

  // Handle Color Changes
  useEffect(() => {
    if (particlesRef.current) {
        const color = new THREE.Color(particleColor);
        const colors = particlesRef.current.geometry.attributes.color.array;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        particlesRef.current.geometry.attributes.color.needsUpdate = true;
    }
  }, [particleColor]);

  const generatePattern = (pattern) => {
    if (!targetPositionsRef.current) return;
    const targets = targetPositionsRef.current;
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;
        
        let x, y, z;
        
        switch (pattern) {
            case PATTERNS.SPHERE:
                const r = 10;
                const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
                const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
                x = r * Math.cos(theta) * Math.sin(phi);
                y = r * Math.sin(theta) * Math.sin(phi);
                z = r * Math.cos(phi);
                break;
            case PATTERNS.HEART:
                // Parametric Heart Equation
                // 16sin^3(t)
                const tHeart = Math.random() * Math.PI * 2;
                // Add some random spread
                const spread = Math.pow(Math.random(), 0.5); // Bias towards 1
                const hScale = 0.8 * spread; 
                x = hScale * (16 * Math.pow(Math.sin(tHeart), 3));
                y = hScale * (13 * Math.cos(tHeart) - 5 * Math.cos(2 * tHeart) - 2 * Math.cos(3 * tHeart) - Math.cos(4 * tHeart));
                z = (Math.random() - 0.5) * 5 * spread; 
                break;
            case PATTERNS.CAKE: // Simple cake shape
                const layer = Math.random();
                if (layer < 0.6) {
                    // Base: Cylinder
                    const ang = Math.random() * Math.PI * 2;
                    const rad = 8 * Math.sqrt(Math.random());
                    x = rad * Math.cos(ang);
                    z = rad * Math.sin(ang);
                    y = -5 + Math.random() * 4; // Bottom layer height
                } else if (layer < 0.9) {
                    // Top: Smaller Cylinder
                    const ang = Math.random() * Math.PI * 2;
                    const rad = 6 * Math.sqrt(Math.random());
                    x = rad * Math.cos(ang);
                    z = rad * Math.sin(ang);
                    y = -1 + Math.random() * 3; // Top layer height
                } else {
                    // Candle: Thin Line
                     x = (Math.random() - 0.5) * 0.5;
                     z = (Math.random() - 0.5) * 0.5;
                     y = 2 + Math.random() * 3;
                }
                break;
            case PATTERNS.RING:
                const rad = 12 + Math.random() * 2;
                const ang = Math.random() * Math.PI * 2;
                x = rad * Math.cos(ang);
                y = (Math.random() - 0.5) * 2; // Flat ring
                z = rad * Math.sin(ang);
                break;
             case PATTERNS.RANDOM:
             default:
                x = (Math.random() - 0.5) * 30;
                y = (Math.random() - 0.5) * 30;
                z = (Math.random() - 0.5) * 30;
        }
        
        targets[ix] = x;
        targets[iy] = y;
        targets[iz] = z;
    }
  };
  
  const toggleFullScreen = () => {
      if (!document.fullscreenElement) {
          mountRef.current.requestFullscreen();
      } else {
          document.exitFullscreen();
      }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', background: '#000', overflow: 'hidden' }} ref={mountRef}>
       {/* Creating a video element for MediaPipe but hiding it */}
       <video 
         ref={videoRef} 
         style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} 
         autoPlay 
         playsInline
         muted
       />

       {/* UI Panel */}
       <div style={{
           position: 'absolute',
           top: '20px',
           left: '20px',
           zIndex: 10,
           background: 'rgba(255, 255, 255, 0.1)',
           padding: '20px',
           borderRadius: '12px',
           backdropFilter: 'blur(10px)',
           border: '1px solid rgba(255,255,255,0.2)',
           color: 'white',
           fontFamily: 'sans-serif',
           display: 'flex',
           flexDirection: 'column',
           gap: '15px',
           width: '240px'
       }}>
           <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>Gesture Particles</h2>
           
           {/* Gesture Status */}
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <div style={{
                   width: '12px', height: '12px', borderRadius: '50%',
                   background: isLoaded ? (gesture === 'CLOSED' ? '#ff4040' : (gesture === 'OPEN' ? '#40ff40' : (gesture === 'NEUTRAL' ? '#4040ff' : '#888'))) : '#333',
                   boxShadow: gesture !== 'NONE' ? '0 0 8px currentColor' : 'none'
               }}></div>
               <span style={{ fontSize: '0.9rem' }}>
                   {isLoaded ? `Status: ${gesture}` : 'Loading Camera...'}
               </span>
           </div>

           {/* Pattern Selection */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Patterns</label>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                   {Object.values(PATTERNS).map(p => (
                       <button
                           key={p}
                           onClick={() => setActivePattern(p)}
                           style={{
                               background: activePattern === p ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                               border: 'none',
                               color: 'white',
                               padding: '8px',
                               borderRadius: '6px',
                               cursor: 'pointer',
                               textTransform: 'capitalize',
                               fontSize: '0.8rem',
                               transition: '0.2s'
                           }}
                       >
                           {p}
                       </button>
                   ))}
               </div>
           </div>

           {/* Color Picker */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Color</label>
                <input 
                    type="color" 
                    value={particleColor} 
                    onChange={(e) => setParticleColor(e.target.value)}
                    style={{ 
                        width: '100%', 
                        height: '30px', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        background: 'transparent'
                    }} 
                />
           </div>

           {/* Fullscreen Button */}
           <button 
               onClick={toggleFullScreen}
               style={{
                   marginTop: '10px',
                   background: '#2196f3',
                   color: 'white',
                   border: 'none',
                   padding: '10px',
                   borderRadius: '6px',
                   cursor: 'pointer',
                   fontWeight: 'bold'
               }}
           >
               Toggle Fullscreen
           </button>
       </div>
       
       <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', pointerEvents: 'none' }}>
           Show hand to camera. 
           <br/>✊ <b>Close</b> to shrink. 
           <br/>🖐 <b>Open</b> to expand.
           <br/>👋 <b>Move hand</b> to rotate view.
           <br/>
           <span style={{ color: '#ff69b4', fontWeight: 'bold' }}>Happy Birthday Version ❤️</span>
       </div>
    </div>
  );
}
