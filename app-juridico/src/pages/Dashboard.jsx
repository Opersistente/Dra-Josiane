import React, { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { calcularPrioridade } from '../lib/priority';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { AlertCircle, CalendarClock, Target, Plus, ShieldCheck, Activity, Users, CheckCircle2, FileDown, Clock } from 'lucide-react';
import { isThisMonth, parseISO } from 'date-fns';
import { generateTasksPDF } from '../lib/pdfGenerator';

export default function Dashboard({ setActiveTab }) {
    const { tarefas } = useTaskStore();
    const [showForm, setShowForm] = useState(false);

    // Filtros
    // calcularPrioridade já retorna 'URGENTE' se a tarefa estiver marcada com is_urgente = true
    const urgentes = tarefas.filter(t => calcularPrioridade(t.prazo, t.is_urgente) === 'URGENTE' && t.status !== 'Concluído');
    const hoje = tarefas.filter(t => calcularPrioridade(t.prazo, t.is_urgente) === 'HOJE' && t.status !== 'Concluído');

    // KPIs (Métricas de Decisão)
    const kpiAtivos = tarefas.filter(t => t.status !== 'Concluído' && t.status !== 'Gaveta').length;

    const hojeDateString = new Date().toISOString().substring(0, 10);
    const kpiVencidos = tarefas.filter(t => t.prazo && t.prazo < hojeDateString && t.status !== 'Concluído' && t.status !== 'Gaveta').length;

    // Concluídos este mês (usando slice seguro para coincidir com o Supabase YYYY-MM)
    const currentMonthPrefix = new Date().toISOString().substring(0, 7); // ex: '2026-03'
    const kpiConcluidosMes = tarefas.filter(t =>
        t.status === 'Concluído' &&
        t.prazo && String(t.prazo).startsWith(currentMonthPrefix)
    ).length;

    // Cálculo da Barra de Progresso (Ativos vs Concluídos no Mês)
    const totalVolumeMensal = kpiAtivos + kpiConcluidosMes;
    // Se não tiver nada, é 0. Se tiver, calcula a %. (Garante no mínimo 1% se houver concluídos para efeito visual e até 100%)
    const rawTaxa = totalVolumeMensal === 0 ? 0 : Math.round((kpiConcluidosMes / totalVolumeMensal) * 100);
    const taxaConclusao = kpiConcluidosMes > 0 && rawTaxa === 0 ? 1 : rawTaxa;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6 shrink-0">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Painel Executivo</h1>
                </div>
                <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => generateTasksPDF(tarefas)}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 shrink-0"
                        title="Exportar todas as tarefas ativas para PDF"
                    >
                        <FileDown size={18} className="text-slate-500" />
                        Relatório PDF
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-blue-200 flex items-center gap-2 shrink-0"
                    >
                        <Plus size={18} />
                        Nova Tarefa
                    </button>
                </div>
            </div>

            {/* Painel de Controle (BI) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 shrink-0">
                {/* Métricas: Processos Ativos */}
                <div
                    onClick={() => setActiveTab('kanban')}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
                    title="Ir para o Kanban"
                >
                    <div className="group-hover:scale-105 transition-transform">
                        <p className="text-slate-500 text-sm font-semibold mb-1 group-hover:text-blue-600 transition-colors">Processos na Esteira</p>
                        <h4 className="text-3xl font-extrabold text-slate-800">{kpiAtivos}</h4>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Activity size={24} />
                    </div>
                </div>

                {/* Métricas: Gargalo (Vencidos) */}
                <div
                    onClick={() => setActiveTab('kanban')}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md hover:border-amber-300 transition-all group"
                    title="Ir para o Kanban"
                >
                    <div className="group-hover:scale-105 transition-transform">
                        <p className="text-slate-500 text-sm font-semibold mb-1 group-hover:text-amber-600 transition-colors">Registros Vencidos</p>
                        <h4 className="text-3xl font-extrabold text-amber-600">{kpiVencidos}</h4>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <Clock size={24} />
                    </div>
                </div>

                {/* Métricas: Urgências Pendentes */}
                <div
                    onClick={() => setActiveTab('kanban')}
                    className="bg-white rounded-2xl p-5 border border-rose-200 shadow-sm flex items-center justify-between relative overflow-hidden cursor-pointer hover:shadow-md hover:border-rose-400 transition-all group"
                    title="Ir para o Kanban"
                >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-rose-100 rounded-bl-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10 group-hover:translate-x-1 transition-transform">
                        <p className="text-rose-600 text-sm font-semibold mb-1">Fogo (Urgentes/Atraso)</p>
                        <h4 className="text-3xl font-extrabold text-rose-700">{urgentes.length}</h4>
                    </div>
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 relative z-10 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                        <AlertCircle size={24} />
                    </div>
                </div>

                {/* Métricas: Desempenho do Mês */}
                <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-100 rounded-bl-full opacity-50"></div>
                    <div className="relative z-10">
                        <p className="text-emerald-700 text-sm font-semibold mb-1">Concluídos (Mês)</p>
                        <h4 className="text-3xl font-extrabold text-emerald-800">{kpiConcluidosMes}</h4>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 relative z-10">
                        <CheckCircle2 size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
                {/* Coluna 1: Foco do Dia (Urgentes) */}
                <div className="flex flex-col bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden h-full shadow-sm">
                    <div className="flex items-center gap-3 p-4 border-b border-slate-200 bg-white shrink-0">
                        <div className="bg-red-100 p-2 rounded-lg text-red-600 shadow-sm"><AlertCircle size={20} /></div>
                        <h2 className="text-xl font-bold text-slate-800">Urgentes <span className="text-sm font-medium text-slate-400 ml-2 hidden sm:inline">Prazos vencidos ou fixados</span></h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {urgentes.length === 0 ? (
                            <div className="bg-white border border-slate-200 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 h-full">
                                <ShieldCheck size={32} className="text-emerald-500 mb-3" />
                                <p className="font-medium text-slate-700">Nenhuma prioridade crítica!</p>
                                <p className="text-sm">Excelente trabalho mantendo tudo em dia. 🎉</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 items-start relative">
                                {urgentes.map(t => <TaskCard key={t.id} tarefa={t} dashboardMode={true} floatExpand={true} />)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Coluna 2: Foco de Hoje */}
                <div className="flex flex-col bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden h-full shadow-sm">
                    <div className="flex items-center gap-3 p-4 border-b border-slate-200 bg-white shrink-0">
                        <div className="bg-orange-100 p-2 rounded-lg text-orange-600 shadow-sm"><CalendarClock size={20} /></div>
                        <h2 className="text-xl font-bold text-slate-800">Urgência para Hoje <span className="text-sm font-medium text-slate-400 ml-2 hidden sm:inline">Vencendo hoje mesmo</span></h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {hoje.length === 0 ? (
                            <div className="bg-white border border-slate-200 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 h-full">
                                <p className="font-medium text-slate-700">Tudo limpo por aqui</p>
                                <p className="text-sm mt-1">Nenhum prazo limite para hoje.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 items-start">
                                {hoje.map(t => <TaskCard key={t.id} tarefa={t} compact />)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Nova Tarefa Sobreposto */}
            {showForm && (
                <TaskForm onClose={() => setShowForm(false)} />
            )}
        </div>
    );
}
