import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { X, Clock } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import DailyScheduleSlot from './DailyScheduleSlot';
import TaskCard from './TaskCard';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const HOURS = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00'
];

export default function DailyScheduleModal({ dateStr, onClose }) {
    const { tarefas, moveTarefaHora } = useTaskStore();
    const [activeId, setActiveId] = useState(null);

    // Formata a data de 'YYYY-MM-DD' para legibilidade na tela principal
    const displayDate = format(parseISO(dateStr), "EEEE, d 'de' MMMM", { locale: ptBR });

    // Filtrar tarefas baseadas apenas neste dia específico
    const dayTasks = tarefas.filter(t => {
        if (!t.prazo) return false;
        return String(t.prazo).substring(0, 10) === dateStr;
    });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeIdStr = active.id;
        let targetHourStr = over.id; // '08:00', '09:00', ou 'SEM_HORA'

        if (targetHourStr === 'SEM_HORA') {
            targetHourStr = null;
        }

        // Executa mutação no Banco
        moveTarefaHora(activeIdStr, targetHourStr);
    };

    const activeTask = activeId ? dayTasks.find(t => t.id === activeId) : null;

    // Split tasks for rendering
    const validHours = HOURS.reduce((acc, h) => {
        acc[h] = dayTasks.filter(t => t.hora_agendada && t.hora_agendada.substring(0, 5) === h);
        return acc;
    }, {});

    // As tarefas cujo "hora_agendada" for nula ou não bater com 08:00 - 20:00 caem no limbo
    const semHoraTasks = dayTasks.filter(t => !t.hora_agendada || !HOURS.includes(t.hora_agendada.substring(0, 5)));

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                onClick={e => e.stopPropagation()}
                className="bg-slate-50 rounded-2xl shadow-2xl w-full mx-2 md:mx-0 md:max-w-5xl h-[95vh] border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            >
                {/* Header Navbar */}
                <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800 capitalize">{displayDate}</h2>
                        <p className="text-slate-500 text-xs md:text-sm mt-1 flex items-center gap-1 md:gap-2">
                            <Clock size={16} /> Agenda de Horários
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 md:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        {/* Coluna da Esquerda: Inbox / Sem Horário */}
                        <div className="w-full md:w-1/3 min-h-[150px] bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col p-4 shadow-inner overflow-y-auto custom-scrollbar shrink-0 md:shrink">
                            <h3 className="font-bold text-slate-700 mb-2 md:mb-3 text-base md:text-lg flex justify-between items-center">
                                Caixa de Entrada
                                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded shadow-sm">{semHoraTasks.length}</span>
                            </h3>
                            <div className="text-xs md:text-sm text-slate-500 mb-4 bg-blue-50 p-2 rounded border border-blue-100 shrink-0">
                                Tarefas com vencimento p/ hoje que ainda não possuem um horário definido na agenda.
                            </div>

                            <DailyScheduleSlot id="SEM_HORA" tasks={semHoraTasks} isInbox />
                        </div>

                        {/* Coluna da Direita: Grade de Horários */}
                        <div className="w-full md:w-2/3 flex-1 overflow-y-auto p-2 md:p-4 custom-scrollbar bg-slate-50">
                            <div className="space-y-3">
                                {HOURS.map(hour => (
                                    <div key={hour} className="flex items-stretch gap-2 md:gap-3">
                                        <div className="w-12 md:w-16 shrink-0 flex justify-end">
                                            <span className="text-slate-500 font-bold text-base md:text-lg leading-loose">{hour}</span>
                                        </div>
                                        <div className="flex-1 border-l-2 border-slate-200 pl-2 md:pl-4 py-1">
                                            <DailyScheduleSlot id={hour} tasks={validHours[hour]} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DragOverlay>
                            {activeTask ? (
                                <div className="shadow-2xl opacity-100 scale-105 rotate-2 cursor-grabbing cursor-pointer touch-none">
                                    <TaskCard tarefa={activeTask} compact />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>
        </div>,
        document.body
    );
}
