import './style.css';
import { FieldDeskApp } from './app';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Application root is missing.');
new FieldDeskApp(root);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'));
}
