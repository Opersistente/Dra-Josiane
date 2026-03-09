import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTaskStore } from '../store/useTaskStore';
import KanbanColumn from '../components/KanbanColumn';
import TaskCard from '../components/TaskCard';
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react';

const COLUMNS = [
    'Gaveta',
    'Hoje',
    'Em andamento',
    'Audiência',
    'Aguardando cliente',
    'Protocolar',
    'Concluído'
];

export default function Kanban() {
    const { tarefas, moveTarefa } = useTaskStore();
    const [activeId, setActiveId] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' = urgentes/próximos primeiro

    const toggleSort = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

    const getSortedTasks = (colTasks) => {
        return [...colTasks].sort((a, b) => {
            if (!a.prazo && !b.prazo) return 0;
            if (!a.prazo) return 1; // Sem prazo vai pro final
            if (!b.prazo) return -1;

            const timeA = new Date(a.prazo).getTime();
            const timeB = new Date(b.prazo).getTime();

            return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
        });
    };

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

        const activeId = active.id;
        const overId = over.id;

        // Check if dragged over a column identifier directly
        if (COLUMNS.includes(overId)) {
            moveTarefa(activeId, overId);
            return;
        }

        // Otherwise find the task we dragged over and take its status
        const overTask = tarefas.find(t => t.id === overId);
        if (overTask && overTask.status) {
            moveTarefa(activeId, overTask.status);
        }
    };

    const activeTask = activeId ? tarefas.find(t => t.id === activeId) : null;

    return (
        <div className="p-8 h-full flex flex-col max-w-full overflow-hidden">
            <div className="mb-6 shrink-0 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Quadro Kanban</h1>
                    <p className="text-slate-500 mt-2 text-sm max-w-xl">Acompanhe o fluxo visual do escritório. Arraste e solte os cartões para atualizar o andamento.</p>
                </div>

                <button
                    onClick={toggleSort}
                    className="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600 hover:text-blue-700 px-4 py-2.5 rounded-xl transition-all shadow-sm font-medium text-sm"
                    title={sortOrder === 'asc' ? "Vendo prazos próximos primeiro" : "Vendo prazos distantes primeiro"}
                >
                    {sortOrder === 'asc' ? (
                        <><ArrowUpNarrowWide size={18} /> Urgentes no Topo</>
                    ) : (
                        <><ArrowDownWideNarrow size={18} /> Distantes no Topo</>
                    )}
                </button>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex justify-start items-start gap-4 h-full align-top w-max h-full">
                        {COLUMNS.map(col => (
                            <KanbanColumn
                                key={col}
                                id={col}
                                title={col}
                                tasks={getSortedTasks(tarefas.filter(t => t.status === col))}
                            />
                        ))}
                    </div>

                    <DragOverlay>
                        {activeTask ? (
                            <div className="shadow-2xl opacity-100 scale-105 rotate-3 cursor-grabbing cursor-pointer touch-none">
                                <TaskCard tarefa={activeTask} compact />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
}
