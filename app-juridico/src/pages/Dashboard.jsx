import React, { useState, useMemo, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { calcularPrioridade } from '../lib/priority';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { AlertCircle, CalendarClock, Target, Plus, ShieldCheck, Activity, Users, CheckCircle2, FileDown, Download, Clock, X } from 'lucide-react';
import { format, isThisMonth, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { generateTasksPDF } from '../lib/pdfGenerator';
import { exportTasksToCsv } from '../lib/csvExporter';
import { exportTasksToJson } from '../lib/jsonExporter';

export default function Dashboard({ setActiveTab }) {
    const { tarefas } = useTaskStore();
    const [showForm, setShowForm] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportPeriodo, setReportPeriodo] = useState('dia');
    const [reportDate, setReportDate] = useState(() => new Date().toLocaleDateString('en-CA'));
    const [reportStatuses, setReportStatuses] = useState([]);
    const [reportMessage, setReportMessage] = useState(null);
    const [reportMessageType, setReportMessageType] = useState('success');

    const availableStatuses = useMemo(() => {
        return Array.from(new Set(tarefas.map(t => t.status).filter(Boolean))).sort();
    }, [tarefas]);

    // Default to all known statuses on first load, if none selected yet
    useEffect(() => {
        if (availableStatuses.length > 0 && reportStatuses.length === 0) {
            setReportStatuses(availableStatuses);
        }
    }, [availableStatuses, reportStatuses.length]);

    const toggleStatus = (status) => {
        setReportStatuses(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    const getRange = (periodo, referenceDate) => {
        const today = referenceDate ? new Date(referenceDate) : new Date();
        if (periodo === 'semana') {
            const start = startOfWeek(today, { weekStartsOn: 1 });
            const end = endOfWeek(today, { weekStartsOn: 1 });
            return { start, end };
        }
        if (periodo === 'mes') {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            return { start, end };
        }
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        return { start, end };
    };

    const previewCount = useMemo(() => {
        if (!reportStatuses.length) return 0;
        const { start, end } = getRange(reportPeriodo, reportDate);
        return tarefas.filter(t => {
            if (!t.prazo) return false;
            if (!reportStatuses.includes(t.status)) return false;
            const taskDate = new Date(`${t.prazo}T00:00:00`);
            return taskDate >= start && taskDate <= end;
        }).length;
    }, [tarefas, reportPeriodo, reportDate, reportStatuses]);

    useEffect(() => {
        if (!reportMessage) return;
        const timer = setTimeout(() => setReportMessage(null), 4800);
        return () => clearTimeout(timer);
    }, [reportMessage]);

    useEffect(() => {
        if (showReportModal) {
            setReportDate(new Date().toLocaleDateString('en-CA'));
        }
    }, [showReportModal]);

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
                    {reportMessage && (
                        <div className={`mt-2 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${reportMessageType === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                            <span className="truncate">{reportMessage}</span>
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => {
                            setReportMessage(null);
                            setShowReportModal(true);
                        }}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 shrink-0"
                        title="Gerar relatório PDF por dia, semana ou mês"
                    >
                        <FileDown size={18} className="text-slate-500" />
                        Relatório PDF
                    </button>
                    <button
                        onClick={() => exportTasksToCsv(tarefas)}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 shrink-0"
                        title="Gerar backup da base em CSV"
                    >
                        <Download size={18} className="text-slate-500" />
                        Backup CSV
                    </button>
                    <button
                        onClick={() => exportTasksToJson(tarefas)}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 shrink-0"
                        title="Gerar backup da base em JSON"
                    >
                        <Download size={18} className="text-slate-500" />
                        Backup JSON
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

            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowReportModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors p-1"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold text-slate-800 mb-4">Gerar Relatório PDF</h3>
                        <p className="text-sm text-slate-600 mb-4">Escolha o período que deseja incluir no relatório.</p>

                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-2">
                                <label className={`cursor-pointer rounded-xl border p-3 text-center transition ${reportPeriodo === 'dia' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <input
                                        type="radio"
                                        name="reportPeriodo"
                                        value="dia"
                                        checked={reportPeriodo === 'dia'}
                                        onChange={() => setReportPeriodo('dia')}
                                        className="hidden"
                                    />
                                    <div className="text-sm font-semibold">Dia</div>
                                    <div className="text-xs text-slate-500">Só hoje</div>
                                </label>
                                <label className={`cursor-pointer rounded-xl border p-3 text-center transition ${reportPeriodo === 'semana' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <input
                                        type="radio"
                                        name="reportPeriodo"
                                        value="semana"
                                        checked={reportPeriodo === 'semana'}
                                        onChange={() => setReportPeriodo('semana')}
                                        className="hidden"
                                    />
                                    <div className="text-sm font-semibold">Semana</div>
                                    <div className="text-xs text-slate-500">Segunda a domingo</div>
                                </label>
                                <label className={`cursor-pointer rounded-xl border p-3 text-center transition ${reportPeriodo === 'mes' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <input
                                        type="radio"
                                        name="reportPeriodo"
                                        value="mes"
                                        checked={reportPeriodo === 'mes'}
                                        onChange={() => setReportPeriodo('mes')}
                                        className="hidden"
                                    />
                                    <div className="text-sm font-semibold">Mês</div>
                                    <div className="text-xs text-slate-500">Mês atual</div>
                                </label>
                            </div>

                            <div className="mt-4">
                                <p className="text-sm font-semibold text-slate-700 mb-2">Status incluídos</p>
                                <div className="flex flex-wrap gap-2">
                                    {availableStatuses.map(status => (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={() => toggleStatus(status)}
                                            className={`px-3 py-2 rounded-full border text-xs font-semibold transition ${reportStatuses.includes(status)
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500 mt-2">Itens combinados: <span className="font-semibold text-slate-700">{previewCount}</span></p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Data de referência</label>
                                <input
                                    type="date"
                                    value={reportDate}
                                    onChange={e => setReportDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        if (previewCount === 0) {
                                            setReportMessage('Nenhum registro encontrado para o período/filtragem escolhidos');
                                            setReportMessageType('error');
                                            return;
                                        }

                                        const result = generateTasksPDF(tarefas, {
                                            periodo: reportPeriodo,
                                            referenceDate: reportDate,
                                            statuses: reportStatuses,
                                        });

                                        if (result.ok) {
                                            setReportMessage('Relatório PDF gerado com sucesso!');
                                            setReportMessageType('success');
                                            setShowReportModal(false);
                                        } else {
                                            setReportMessage(`Falha ao gerar o PDF: ${result.message || 'verifique o console'}`);
                                            setReportMessageType('error');
                                        }
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2"
                                >
                                    <FileDown size={16} />
                                    Gerar PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
