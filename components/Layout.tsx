
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ShoppingBag, 
  DollarSign, 
  LogOut, 
  Menu, 
  X,
  Gem
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'orcamentos', label: 'Orçamentos', icon: FileText },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Sidebar Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-zinc-900 border-r border-zinc-800 transition-transform duration-300 md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <Gem className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Rochedo</h1>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                  ${activeTab === item.id 
                    ? 'bg-emerald-600/10 text-emerald-500' 
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'}
                `}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-zinc-800">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
            >
              <LogOut size={20} />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header Mobile */}
        <header className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800 md:hidden">
          <div className="flex items-center gap-2">
            <Gem className="text-emerald-500" size={24} />
            <span className="font-bold">Rochedo</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-zinc-400"
          >
            <Menu size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
