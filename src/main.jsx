import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App.jsx';

const container = document.getElementById('app');

if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.warn('Elemen #app tidak ditemukan, React tidak dirender.');
}
