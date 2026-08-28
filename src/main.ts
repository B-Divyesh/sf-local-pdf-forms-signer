import './style.css';
import { FieldDeskApp } from './app';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Application root is missing.');
new FieldDeskApp(root);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  void navigator.serviceWorker.register('/sw.js').then(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
    }
    document.documentElement.dataset.offlineReady = 'true';
    window.dispatchEvent(new CustomEvent('field-desk:offline-ready'));
  }).catch(() => {
    // Online use remains available when a browser disables service workers.
  });
}
