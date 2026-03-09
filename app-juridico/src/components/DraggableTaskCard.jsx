import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import TaskCard from './TaskCard';

export default function DraggableTaskCard({ task, compact = false }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: task.id,
        data: task,
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`cursor-grab touch-none ${isDragging ? 'opacity-30' : ''}`}
        >
            {/* 
                We use pointer-events-none inside the draggable surface to prevent 
                child buttons (like complete/delete/edit) from intercepting the drag event.
                In a more complex setup, you'd isolate a "drag handle".
            */}
            <div className="pointer-events-none">
                <TaskCard tarefa={task} compact={compact} />
            </div>
        </div>
    );
}
