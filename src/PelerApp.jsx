import React from 'react';
import ReactDOM from 'react-dom/client';
import Beams from './component/Beams';

function PelerApp() {
  return (
    <div style={{ 
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none'
    }}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Beams
          beamWidth={3}
          beamHeight={30}
          beamNumber={20}
          lightColor="#ffffff"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={30}
        />
      </div>
    </div>
  );
}

const root = document.getElementById('floatingLinesRoot');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <PelerApp />
    </React.StrictMode>
  );
}
