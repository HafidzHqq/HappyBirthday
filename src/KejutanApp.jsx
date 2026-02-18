import React from 'react';
import ReactDOM from 'react-dom/client';
import KejutanBunga from './component/KejutanBunga';

const root = document.getElementById('kejutanRoot');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <KejutanBunga />
    </React.StrictMode>
  );
}
