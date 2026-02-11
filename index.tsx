
import React from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <h1 className="text-zinc-400 font-light tracking-widest uppercase">Página em Branco</h1>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
