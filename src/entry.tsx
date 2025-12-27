import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

export type MountProps = { userId?: string };

export function mount(el: HTMLElement, props?: MountProps) {
  const root = ReactDOM.createRoot(el);
  root.render(<App/>);
  return () => root.unmount();
}
