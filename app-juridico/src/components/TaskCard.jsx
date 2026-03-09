import React, { useState } from 'react';
import { Calendar, User, FileText, Edit2, Loader2, AlertTriangle } from 'lucide-react';
import { calcularPrioridade, getPriorityColor } from '../lib/priority';
import { useTaskStore } from '../store/useTaskStore';
import EditTaskModal from './EditTaskModal';

export default function TaskCard({ tarefa, compact = false }) {
    const prioridade = calcularPrioridade(tarefa.prazo, tarefa.is_urgente);
    const corPrioridade = getPriorityColor(prioridade);
    const { deleteTarefa } = useTaskStore();

    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (window.confirm(`Tem certeza que deseja excluir:\n"${tarefa.tarefa}"?`)) {
            setIsDeleting(true);
            await deleteTarefa(tarefa.id);
            setIsDeleting(false);
        }
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const isCrucial = prioridade === 'URGENTE' || tarefa.status === 'Audiência';

    return (
        <>
            <div
                onClick={() => setIsEditing(true)}
                className={`bg-white rounded-xl shadow-sm border relative p-4 transition-all hover:shadow-md cursor-pointer group ${compact ? 'py-3' : ''} ${isDeleting ? 'opacity-50 pointer-events-none' : ''} ${isCrucial ? 'border-red-500 ring-4 ring-red-100 animate-[pulse_2s_ease-in-out_infinite]' : 'border-slate-200'}`}
            >

                {isDeleting && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                        <Loader2 className="animate-spin text-slate-500" size={24} />
                    </div>
                )}

                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${corPrioridade}`}>
                            {prioridade}
                        </span>
                        {tarefa.is_urgente && (
                            <span className="text-red-500 bg-red-50 p-1 rounded-full border border-red-100" title="Urgência Fixada">
                                <AlertTriangle size={14} />
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={handleEditClick}
                            className="text-slate-400 hover:text-blue-500 transition-colors bg-white hover:bg-slate-50 rounded-full p-1 border border-transparent hover:border-slate-200 shadow-sm"
                            title="Editar tarefa"
                        >
                            <Edit2 size={14} />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-slate-50 rounded-full p-1 border border-transparent hover:border-slate-200 shadow-sm"
                            title="Excluir tarefa"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-1 text-slate-800 font-semibold">
                    <User size={16} className="text-slate-400 shrink-0" />
                    <span className="truncate">{tarefa.cliente}</span>
                </div>

                <div className="flex items-start gap-2 mb-3 text-slate-600 text-sm">
                    <FileText size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-tight">{tarefa.tarefa}</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-auto pt-2 border-t border-slate-100">
                    <Calendar size={14} className="text-slate-400" />
                    {/* Workaround para o erro de fuso e dia "-1" exibido pelo React */}
                    <span>Prazo: {tarefa.prazo ? new Date(tarefa.prazo + 'T00:00:00').toLocaleDateString('pt-BR') : ''}</span>
                </div>
            </div>

            {isEditing && (
                <EditTaskModal
                    tarefa={tarefa}
                    onClose={() => setIsEditing(false)}
                />
            )}
        </>
    );
}
