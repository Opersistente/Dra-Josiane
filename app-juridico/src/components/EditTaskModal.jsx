import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTaskStore } from '../store/useTaskStore';
import { X, Save, Trash2 } from 'lucide-react';

export default function EditTaskModal({ tarefa, onClose }) {
    const { updateTarefa, deleteTarefa } = useTaskStore();

    const [formData, setFormData] = useState({
        cliente: tarefa.cliente || '',
        tarefa: tarefa.tarefa || '',
        prazo: tarefa.prazo ? new Date(tarefa.prazo).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: tarefa.status || 'Gaveta',
        is_urgente: tarefa.is_urgente || false,
    });

    // Fecha no "ESC"
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updateTarefa(tarefa.id, formData);
        onClose();
    };

    const handleDelete = async () => {
        if (window.confirm("Certeza que deseja excluir este processo permanentemente?")) {
            await deleteTarefa(tarefa.id);
            onClose();
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                onClick={e => e.stopPropagation()}
                className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 relative animate-in zoom-in-95 duration-200"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors p-1"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-slate-800 mb-5">Editar Tarefa</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cliente / Processo</label>
                        <input
                            required
                            type="text"
                            value={formData.cliente}
                            onChange={e => setFormData({ ...formData, cliente: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ação / Tarefa</label>
                        <textarea
                            required
                            rows="4"
                            value={formData.tarefa}
                            onChange={e => setFormData({ ...formData, tarefa: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none custom-scrollbar"
                        ></textarea>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Prazo</label>
                            <input
                                required
                                type="date"
                                value={formData.prazo}
                                onChange={e => setFormData({ ...formData, prazo: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                            >
                                <option value="Gaveta">Gaveta</option>
                                <option value="Hoje">Hoje</option>
                                <option value="Em andamento">Em andamento</option>
                                <option value="Audiência">Audiência</option>
                                <option value="Aguardando cliente">Aguardando cliente</option>
                                <option value="Protocolar">Protocolar</option>
                                <option value="Concluído">Concluído</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2 p-3 bg-red-50/50 rounded-lg border border-red-100">
                        <input
                            type="checkbox"
                            id="edit_is_urgente"
                            checked={formData.is_urgente}
                            onChange={e => setFormData({ ...formData, is_urgente: e.target.checked })}
                            className="w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500"
                        />
                        <label htmlFor="edit_is_urgente" className="text-sm font-medium text-red-800 cursor-pointer">
                            Forçar Urgência Máxima (Ignorar prazo)
                        </label>
                    </div>

                    <div className="pt-2 flex justify-between items-center mt-4">
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 font-medium py-2 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                            <Trash2 size={18} />
                            Excluir
                        </button>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium py-2 px-4 rounded-xl transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Save size={18} />
                                Salvar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
