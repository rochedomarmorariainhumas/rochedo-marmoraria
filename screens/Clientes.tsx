
import React, { useState, useEffect } from 'react';
// Added Users to imports from lucide-react
import { Plus, Search, User, Users, Phone, Mail, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { storage } from '../services/storage';
import { Cliente } from '../types';

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    documento: '',
    email: '',
    telefone: '',
    endereco: ''
  });

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = () => {
    setClientes(storage.clientes.getAll());
  };

  const filteredClientes = clientes.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCliente) {
      storage.clientes.update(editingCliente.id, formData);
    } else {
      storage.clientes.add(formData);
    }
    setFormData({ nome: '', documento: '', email: '', telefone: '', endereco: '' });
    setEditingCliente(null);
    setIsModalOpen(false);
    loadClientes();
  };

  const handleEdit = (c: Cliente) => {
    setEditingCliente(c);
    setFormData({
      nome: c.nome,
      documento: c.documento,
      email: c.email,
      telefone: c.telefone,
      endereco: c.endereco
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este cliente?')) {
      storage.clientes.delete(id);
      loadClientes();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Clientes</h2>
          <p className="text-zinc-400">Gerencie sua base de contatos.</p>
        </div>
        <button 
          onClick={() => { setEditingCliente(null); setFormData({ nome: '', documento: '', email: '', telefone: '', endereco: '' }); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-900/20"
        >
          <Plus size={20} />
          Novo Cliente
        </button>
      </header>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-zinc-500" size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Buscar por nome ou email..." 
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClientes.map(cliente => (
          <div key={cliente.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-300 font-bold group-hover:bg-emerald-600/10 group-hover:text-emerald-500 transition-colors">
                <User size={24} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(cliente)} className="p-2 text-zinc-500 hover:text-zinc-200"><Edit2 size={18} /></button>
                <button onClick={() => handleDelete(cliente.id)} className="p-2 text-zinc-500 hover:text-rose-500"><Trash2 size={18} /></button>
              </div>
            </div>
            <h3 className="text-lg font-bold">{cliente.nome}</h3>
            <p className="text-sm text-zinc-500 mb-4">{cliente.documento}</p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Phone size={14} className="text-emerald-500" />
                {cliente.telefone}
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Mail size={14} className="text-emerald-500" />
                {cliente.email}
              </div>
            </div>
          </div>
        ))}

        {filteredClientes.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-900 mb-4">
              <Users size={40} className="text-zinc-700" />
            </div>
            <h3 className="text-xl font-medium text-zinc-500">Nenhum cliente encontrado</h3>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-8 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">{editingCliente ? 'Editar Cliente' : 'Novo Cliente'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Nome Completo</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100"
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">CPF/CNPJ</label>
                  <input 
                    type="text" 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100"
                    value={formData.documento}
                    onChange={e => setFormData({...formData, documento: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Telefone</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100"
                    value={formData.telefone}
                    onChange={e => setFormData({...formData, telefone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">E-mail</label>
                <input 
                  required
                  type="email" 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Endereço</label>
                <textarea 
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100"
                  value={formData.endereco}
                  onChange={e => setFormData({...formData, endereco: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-zinc-400 font-medium border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all">
                  {editingCliente ? 'Salvar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
