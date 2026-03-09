import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableTaskCard from './DraggableTaskCard';
import TaskCard from './TaskCard';

export default function DailyScheduleSlot({ id, tasks = [], isInbox = false }) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    return (
        <div
            ref={setNodeRef}
            className={`min-h-[60px] h-full rounded flex flex-col gap-2 transition-colors ${isOver ? 'bg-blue-100 ring-2 ring-blue-400' : isInbox ? 'bg-transparent' : 'bg-white border border-slate-200 shadow-sm p-2 flex-grow'
                }`}
        >
            {tasks.length === 0 && !isInbox && (
                <div className="text-slate-300 text-xs italic flex items-center h-full pt-1 px-2">
                    Livre
                </div>
            )}

            {/* 
                We use the simplest form of DnD logic here. Dnd-Kit manages dragging.
                To avoid complicated sortings strictly for hours, we just map Draggables.
            */}
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                    {tasks.map(task => (
                        <DraggableTaskCard key={task.id} task={task} compact />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}
