import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Helper to remove any internal metadata if needed, usually not necessary but good practice
const sanitizeTask = (task) => {
    const { id, created_at, ...clean } = task;
    return clean;
};

export const useTaskStore = create((set, get) => ({
    tarefas: [],
    loading: false,
    error: null,

    fetchTarefas: async () => {
        set({ loading: true, error: null });
        const { data, error } = await supabase
            .from('tarefas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tasks', error);
            set({ error: error.message, loading: false });
            return;
        }

        set({ tarefas: data || [], loading: false });
    },

    addTarefa: async (tarefa) => {
        // Optimistic UI update
        const tempId = crypto.randomUUID();
        const newTask = { ...tarefa, id: tempId, status: tarefa.status || 'Gaveta', is_urgente: tarefa.is_urgente || false, created_at: new Date().toISOString() };

        set((state) => ({
            tarefas: [newTask, ...state.tarefas]
        }));

        // Insert into DB
        const { data, error } = await supabase
            .from('tarefas')
            .insert([sanitizeTask(newTask)])
            .select()
            .single();

        if (error) {
            console.error('Error adding task:', error);
            // Revert optimistic update on failure
            set((state) => ({ tarefas: state.tarefas.filter(t => t.id !== tempId) }));
            return;
        }

        // Replace temp task with real DB task
        set((state) => ({
            tarefas: state.tarefas.map(t => t.id === tempId ? data : t)
        }));
    },

    updateTarefa: async (id, updates) => {
        // Fetch the task as it was before editing
        const previousTask = get().tarefas.find(t => t.id === id);

        // Optimistic update
        set((state) => ({
            tarefas: state.tarefas.map(t => t.id === id ? { ...t, ...updates } : t)
        }));

        const { error } = await supabase
            .from('tarefas')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating task', error);
            // Revert to old state
            set((state) => ({
                tarefas: state.tarefas.map(t => t.id === id ? previousTask : t)
            }));
        }
    },

    deleteTarefa: async (id) => {
        // Store task just in case it fails and needs to be returned
        const deletedTask = get().tarefas.find(t => t.id === id);

        // Optimistic delete
        set((state) => ({
            tarefas: state.tarefas.filter(t => t.id !== id)
        }));

        const { error } = await supabase
            .from('tarefas')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting task', error);
            // Revert string optimistic response
            set((state) => ({
                tarefas: [...state.tarefas, deletedTask]
            }));
        }
    },

    moveTarefa: async (id, newStatus) => {
        // Fetch previous status in case we need to revert
        const previousTask = get().tarefas.find(t => t.id === id);
        const previousStatus = previousTask.status;

        // Fast local mutation for drag and drop fluidity
        set((state) => ({
            tarefas: state.tarefas.map(t => t.id === id ? { ...t, status: newStatus } : t)
        }));

        const { error } = await supabase
            .from('tarefas')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            console.error('Error moving task', error);
            // Revert block
            set((state) => ({
                tarefas: state.tarefas.map(t => t.id === id ? { ...t, status: previousStatus } : t)
            }));
        }
    },
}));
