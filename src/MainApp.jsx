import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import ScrollStack, { ScrollStackItem } from './component/ScrollStack';
import ResponsiveNav from './component/ResponsiveNav';
import CircularGallery from './component/CircularGallery';
import './styles.css';
import DomeGallery from './component/DomeGallery';

function MainApp() {
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    document.body.classList.add('main-app');
    return () => document.body.classList.remove('main-app');
  }, []);

  useEffect(() => {
    const mobileMq = window.matchMedia('(max-width: 768px)');
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncMobile = () => setIsMobile(mobileMq.matches);
    const syncMotion = () => setReducedMotion(motionMq.matches);

    syncMobile();
    syncMotion();

    mobileMq.addEventListener('change', syncMobile);
    motionMq.addEventListener('change', syncMotion);

    return () => {
      mobileMq.removeEventListener('change', syncMobile);
      motionMq.removeEventListener('change', syncMotion);
    };
  }, []);

  const isLite = isMobile || reducedMotion;

  return (
    <>
      <ResponsiveNav />
      <ScrollStack
        itemDistance={isLite ? 70 : 100}
        itemScale={isLite ? 0.02 : 0.04}
        itemStackDistance={isLite ? 12 : 20}
        stackPosition="20%"
        baseScale={isLite ? 0.92 : 0.88}
        rotationAmount={isLite ? 0 : 1}
        useWindowScroll={true}
      >
        <div>
        <ScrollStackItem>
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '30px',
            overflow: 'hidden',
            padding: 0
          }}>
            <img
              src="./public/wa.jpeg"
              alt="Random Unsplash"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </ScrollStackItem>

        <ScrollStackItem>
          <div style={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '30px',
            overflow: 'hidden',
            padding: 0
          }}>
            <img
              src="./public/c.jpg"
              alt="Random Unsplash"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </ScrollStackItem>

        <ScrollStackItem>
          <div style={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '30px',
            overflow: 'hidden',
            padding: 0
          }}>
            <img
              src="./public/d.jpg"
              alt="Random Unsplash"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </ScrollStackItem>

        <ScrollStackItem>
          <div style={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '30px',
            overflow: 'hidden',
            padding: 0
          }}>
            <img
              src="./public/e.jpg"
              alt="Random Unsplash"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </ScrollStackItem>

        <ScrollStackItem>
          <div style={{ 
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '30px',
            overflow: 'hidden',
            padding: 0
          }}>
            <img
              src="./public/wawa1.png"
              alt="Random Unsplash"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </ScrollStackItem>

        <ScrollStackItem>
          <div style={{ 
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '30px',
            overflow: 'hidden',
            padding: 0
          }}>
            <img
              src="./public/wawa.png"
              alt="Random Unsplash"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </ScrollStackItem>
        </div>

        
      </ScrollStack>
      <section style={{ padding: '40px 0' }}>
        <div style={{
          height: isLite ? '360px' : '600px',
          width: '100%',
          borderRadius: '30px',
          overflow: 'hidden',
          maxWidth: '100%',
          margin: '0 auto'
        }}>
          <CircularGallery
            bend={isLite ? 0.8 : 3}
            textColor="#ffffff"
            borderRadius={0.12}
            scrollSpeed={isLite ? 0.8 : 1.6}
            scrollEase={isLite ? 0.08 : 0.04}
          />
        </div>
      </section>

      <section style={{ paddingTop: isLite ? '80px' : '150px' }}>
        <div style={{ width: '100vw', height: isLite ? '70vh' : '100vh' }}>
          <DomeGallery
            fit={isLite ? 0.6 : 0.8}
            minRadius={isLite ? 360 : 600}
            maxVerticalRotationDeg={isLite ? 4 : 0}
            segments={isLite ? 18 : 34}
            dragDampening={isLite ? 3 : 2}
            grayscale
          />
        </div>
      </section>


    </>
  );
}

// Render ke DOM
const root = document.getElementById('mainApp');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <MainApp />
    </React.StrictMode>
  );
}