import React from 'react';
import ReactDOM from 'react-dom/client';
import HandParticleSystem from './component/HandParticleSystem';

function PipeApp() {
  return (
    <div style={{ 
      position: 'fixed',
      inset: 0,
      zIndex: 0,
    }}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <HandParticleSystem />
      </div>
    </div>
  );
}

const root = document.getElementById('pipeRoot');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <PipeApp />
    </React.StrictMode>
  );
}
