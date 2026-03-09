import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';

export default function SortableTaskCard({ tarefa }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: tarefa.id, data: { status: tarefa.status } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1, // Hide original element while dragging, since DragOverlay handles it
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="cursor-pointer hover:scale-[1.02] active:scale-100 transition-transform origin-center touch-none"
        >
            <TaskCard tarefa={tarefa} compact />
        </div>
    );
}
