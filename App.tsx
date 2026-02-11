
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './screens/Dashboard';
import Clientes from './screens/Clientes';
import Orcamentos from './screens/Orcamentos';
import Pedidos from './screens/Pedidos';
import Financeiro from './screens/Financeiro';
import { Gem, Lock, Mail, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Simulate initial loading / check session
    const checkSession = setTimeout(() => {
      const loggedIn = localStorage.getItem('rochedo_logged_in') === 'true';
      setIsAuthenticated(loggedIn);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(checkSession);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    // Initial administrator login mock (admin@rochedo.com / admin123)
    setTimeout(() => {
      if (email === 'admin@rochedo.com' && password === 'admin123') {
        setIsAuthenticated(true);
        localStorage.setItem('rochedo_logged_in', 'true');
      } else {
        setAuthError('E-mail ou senha incorretos.');
      }
      setIsLoading(false);
    }, 1200);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('rochedo_logged_in');
  };

  if (isLoading && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
        <p className="text-zinc-500 font-medium tracking-widest uppercase text-xs">Carregando Sistema</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row">
        {/* Left Side - Visual */}
        <div className="hidden lg:flex flex-1 relative bg-zinc-900 overflow-hidden items-center justify-center">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
               {Array.from({ length: 100 }).map((_, i) => (
                 <div key={i} className="border border-zinc-700" />
               ))}
             </div>
          </div>
          <div className="relative z-10 text-center space-y-4 px-12">
            <div className="inline-flex p-4 bg-emerald-600 rounded-3xl mb-4">
              <Gem className="text-white" size={48} />
            </div>
            <h1 className="text-5xl font-black tracking-tighter">Rochedo<br/>Marmoraria</h1>
            <p className="text-xl text-zinc-400 max-w-md mx-auto">Excelência em cada detalhe. O sistema de gestão pensado para Marmoristas.</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="lg:hidden text-center mb-8">
               <Gem className="text-emerald-500 mx-auto mb-2" size={40} />
               <h2 className="text-2xl font-bold">Rochedo</h2>
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-bold">Acesso ao Painel</h3>
              <p className="text-zinc-500">Insira suas credenciais para gerenciar a marmoraria.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                    <Mail size={16} /> E-mail
                  </label>
                  <input 
                    required
                    type="email" 
                    placeholder="exemplo@marmoraria.com"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                    <Lock size={16} /> Senha
                  </label>
                  <input 
                    required
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {authError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-sm font-medium flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {authError}
                </div>
              )}

              <button 
                disabled={isLoading}
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-900/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar no Sistema'}
              </button>

              <p className="text-center text-zinc-600 text-sm">
                Esqueceu sua senha? Entre em contato com o suporte.
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'clientes': return <Clientes />;
      case 'orcamentos': return <Orcamentos />;
      case 'pedidos': return <Pedidos />;
      case 'financeiro': return <Financeiro />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
      {renderScreen()}
    </Layout>
  );
};

export default App;
