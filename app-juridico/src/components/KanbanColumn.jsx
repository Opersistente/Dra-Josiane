import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTaskCard from './SortableTaskCard';

export default function KanbanColumn({ id, title, tasks }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            className={`bg-slate-100/50 rounded-2xl w-[320px] shrink-0 flex flex-col h-[calc(100vh-180px)] overflow-hidden border transition-colors ${isOver ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200/60'
                }`}
        >
            <div className="p-4 bg-slate-100/80 border-b border-slate-200/60 font-bold text-slate-700 flex justify-between items-center backdrop-blur-sm sticky top-0 z-10">
                {title}
                <span className="bg-white shadow-sm border border-slate-200 text-slate-600 font-medium text-xs px-2.5 py-1 rounded-full">
                    {tasks.length}
                </span>
            </div>

            <div
                ref={setNodeRef}
                className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 custom-scrollbar"
            >
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(t => (
                        <SortableTaskCard key={t.id} tarefa={t} />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="h-full border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-sm font-medium opacity-50">
                        Arraste tarefas para cá
                    </div>
                )}
            </div>
        </div>
    );
}
