import React, { useState } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { getPriorityColor, calcularPrioridade } from '../lib/priority';
import EditTaskModal from '../components/EditTaskModal';
import DailyScheduleModal from '../components/DailyScheduleModal';

export default function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [editingTask, setEditingTask] = useState(null);
    const [selectedDailyDate, setSelectedDailyDate] = useState(null);
    const { tarefas } = useTaskStore();

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    // Calendar logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Domingo
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const dateFormat = "MMMM yyyy";
    const days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
            formattedDate = format(day, "d");
            const cloneDay = day;

            // Usa a biblioteca date-fns para extrair de forma segura o ano-mes-dia preservando o fuso de quem clica
            const targetDateStr = format(cloneDay, 'yyyy-MM-dd');

            const dayTasks = tarefas.filter(t => {
                if (!t.prazo) return false;
                // Extrai apenas os 10 primeiros caracteres (YYYY-MM-DD) do Supabase que já vem limpo
                const prazoOnlyDate = String(t.prazo).substring(0, 10);
                return prazoOnlyDate === targetDateStr;
            });

            days.push(
                <div
                    key={`cal-day-${targetDateStr}`}
                    onClick={() => setSelectedDailyDate(targetDateStr)}
                    className={`min-h-[120px] p-2 border-r border-b border-slate-200 flex flex-col transition-colors cursor-pointer ${!isSameMonth(cloneDay, monthStart)
                        ? "bg-slate-50/50 text-slate-400"
                        : isSameDay(cloneDay, new Date())
                            ? "bg-blue-50/30 text-blue-600 font-semibold"
                            : "bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm ${isSameDay(cloneDay, new Date()) ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
                            {formattedDate}
                        </span>
                        {dayTasks.length > 0 && (
                            <span className="text-xs font-medium text-slate-400">{dayTasks.length} tab.</span>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1.5 mt-1 pr-1 custom-scrollbar">
                        {dayTasks.map(task => {
                            const prio = calcularPrioridade(task.prazo, task.is_urgente);
                            const prioColor = getPriorityColor(prio);

                            return (
                                <div
                                    key={task.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingTask(task);
                                    }}
                                    className={`text-xs p-1.5 rounded border cursor-pointer hover:shadow-sm transition-all truncate ${prioColor} ${task.status === 'Concluído' ? 'opacity-50 grayscale hover:opacity-80 border-dashed line-through text-slate-500 bg-slate-100' : ''}`}
                                    title={`${task.cliente} - ${task.tarefa}`}
                                >
                                    <span className="font-bold mr-1">{task.is_urgente ? '🚨' : ''}</span>
                                    <span className="font-semibold truncate">{task.cliente}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            );
            day = addDays(day, 1);
        }
    }

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <div className="p-4 md:p-8 max-w-full mx-auto h-full flex flex-col">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6 shrink-0 w-full">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        <CalendarIcon size={28} className="text-blue-600" />
                        Calendário de Prazos
                    </h1>
                    <p className="text-slate-500 mt-2 text-xs md:text-sm max-w-xl">Visualize sua distribuição de tarefas mensais para equilibrar o peso do trabalho.</p>
                </div>

                <div className="flex gap-2 md:gap-4 items-center bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm w-full md:w-auto space-between md:justify-start">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-slate-800 font-bold min-w-[140px] text-center capitalize">
                        {format(currentDate, dateFormat, { locale: ptBR })}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1 flex flex-col custom-scrollbar">
                    <div className="min-w-[800px] flex-1 flex flex-col">
                        {/* Calendar Header */}
                        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 shrink-0">
                            {weekDays.map(dia => (
                                <div key={dia} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200 last:border-r-0">
                                    {dia}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 flex-1 overflow-y-auto auto-rows-[minmax(120px,1fr)]">
                            {days}
                        </div>
                    </div>
                </div>
            </div>

            {editingTask && (
                <EditTaskModal
                    tarefa={editingTask}
                    onClose={() => setEditingTask(null)}
                />
            )}

            {selectedDailyDate && (
                <DailyScheduleModal
                    dateStr={selectedDailyDate}
                    onClose={() => setSelectedDailyDate(null)}
                />
            )}
        </div>
    );
}
