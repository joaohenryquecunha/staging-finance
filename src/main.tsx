import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('ServiceWorker registration successful:', registration);
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  });
}

// Adiciona evento para instalação do PWA
window.addEventListener('beforeinstallprompt', (e) => {
  // Previne o comportamento padrão
  e.preventDefault();
  // Armazena o evento para usar depois
  window.deferredPrompt = e;
  // Log para debug
  console.log('PWA install prompt detected and saved');
});

// Log quando o PWA é instalado com sucesso
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed successfully');
  window.deferredPrompt = null;
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);