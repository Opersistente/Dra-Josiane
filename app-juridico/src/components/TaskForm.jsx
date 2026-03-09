import React, { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Plus, X } from 'lucide-react';

export default function TaskForm({ onClose }) {
    const { addTarefa } = useTaskStore();
    const [formData, setFormData] = useState({
        cliente: '',
        tarefa: '',
        prazo: new Date().toISOString().split('T')[0],
        status: 'Gaveta',
        is_urgente: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addTarefa(formData);
        setFormData({ cliente: '', tarefa: '', prazo: new Date().toISOString().split('T')[0], status: 'Gaveta', is_urgente: false });
        if (onClose) onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors p-1"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-slate-800 mb-5">Nova Tarefa</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cliente / Processo</label>
                        <input
                            required
                            type="text"
                            value={formData.cliente}
                            onChange={e => setFormData({ ...formData, cliente: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                            placeholder="Ex: Mariano Jadir Moreira"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ação / Tarefa</label>
                        <input
                            required
                            type="text"
                            value={formData.tarefa}
                            onChange={e => setFormData({ ...formData, tarefa: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                            placeholder="Ex: Informar novo endereço"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Prazo</label>
                            <input
                                required
                                type="date"
                                value={formData.prazo}
                                onChange={e => setFormData({ ...formData, prazo: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status Inicial</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm bg-white"
                            >
                                <option value="Gaveta">Gaveta (Backlog)</option>
                                <option value="Hoje">Hoje</option>
                                <option value="Em andamento">Em andamento</option>
                                <option value="Audiência">Audiência</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2 p-3 bg-red-50/50 rounded-lg border border-red-100">
                        <input
                            type="checkbox"
                            id="is_urgente"
                            checked={formData.is_urgente}
                            onChange={e => setFormData({ ...formData, is_urgente: e.target.checked })}
                            className="w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500"
                        />
                        <label htmlFor="is_urgente" className="text-sm font-medium text-red-800 cursor-pointer">
                            Forçar Urgência Máxima (Ignorar prazo)
                        </label>
                    </div>

                    <button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm">
                        <Plus size={18} />
                        Adicionar Tarefa
                    </button>
                </form>
            </div>
        </div>
    );
}
