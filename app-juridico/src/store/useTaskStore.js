import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'luisoliveira.bb@gmail.com';

// Helper to remove any internal metadata if needed, usually not necessary but good practice
const sanitizeTask = (task) => {
    const { id, created_at, ...clean } = task;
    return clean;
};

// Parses postgres error messages like:
//   "column \"is_urgente\" does not exist"
// and returns the missing column names.
const getMissingColumnsFromError = (error) => {
    if (!error?.details) return [];
    const regex = /column \"([^\"]+)\" does not exist/gi;
    const cols = [];
    let match;
    while ((match = regex.exec(error.details)) !== null) {
        cols.push(match[1]);
    }
    return cols;
};

export const useTaskStore = create((set, get) => ({
    user: null,
    tarefas: [],
    loading: false,
    error: null,

    setUser: (user) => set({ user }),

    clearError: () => set({ error: null }),

    fetchTarefas: async () => {
        const user = get().user;
        set({ loading: true, error: null });

        try {
            const isAdmin = user?.email === ADMIN_EMAIL;
            const userId = user?.id;
            const userEmail = user?.email;

            let query = supabase
                .from('tarefas')
                .select('*')
                .order('created_at', { ascending: false });

            // If we have a logged-in user (not admin), filter down to tasks assigned to them.
            if (!isAdmin && userId) {
                const filters = [];
                if (userEmail) filters.push(`assigned_to_email.eq.${userEmail}`);
                filters.push(`user_id.eq.${userId}`);
                query = query.or(filters.join(','));
            }

            const { data, error } = await query;

            if (error) {
                // If one of the columns doesn't exist, try falling back to whichever does.
                const missingUserId = error.details?.includes('column "user_id" does not exist');
                const missingAssignedTo = error.details?.includes('column "assigned_to_email" does not exist');

                if (!isAdmin && (missingUserId || missingAssignedTo)) {
                    let fallbackQuery = supabase
                        .from('tarefas')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (!missingUserId && userId) {
                        fallbackQuery = fallbackQuery.eq('user_id', userId);
                    } else if (!missingAssignedTo && userEmail) {
                        fallbackQuery = fallbackQuery.eq('assigned_to_email', userEmail);
                    }

                    const { data: fallbackData, error: fallbackError } = await fallbackQuery;
                    if (fallbackError) {
                        throw fallbackError;
                    }

                    set({ tarefas: fallbackData || [], loading: false });
                    return;
                }

                throw error;
            }

            set({ tarefas: data || [], loading: false });
        } catch (error) {
            console.error('Error fetching tasks', error);
            set({ error: error.message, loading: false });
        }
    },

    addTarefa: async (tarefa) => {
        set({ error: null });
        const user = get().user;
        // Optimistic UI update
        const tempId = crypto.randomUUID();
        const isAdmin = user?.email === ADMIN_EMAIL;
        const assignedToEmail = isAdmin ? (tarefa.assigned_to_email?.trim() || null) : user?.email;
        const newTask = {
            ...tarefa,
            id: tempId,
            status: tarefa.status || 'Gaveta',
            is_urgente: tarefa.is_urgente || false,
            created_at: new Date().toISOString(),
            user_id: isAdmin ? null : user?.id,
            assigned_to_email: assignedToEmail,
        };

        set((state) => ({
            tarefas: [newTask, ...state.tarefas]
        }));

        // Insert into DB
        const taskToInsert = sanitizeTask(newTask);
        const { data, error } = await supabase
            .from('tarefas')
            .insert([taskToInsert])
            .select()
            .single();

        if (error) {
            const missingCols = getMissingColumnsFromError(error);
            if (missingCols.length) {
                const retryPayload = { ...taskToInsert };
                missingCols.forEach((col) => delete retryPayload[col]);

                const { data: retryData, error: retryError } = await supabase
                    .from('tarefas')
                    .insert([retryPayload])
                    .select()
                    .single();

                if (retryError) {
                    console.error('Error adding task (retry):', retryError);
                    set({ error: retryError.message });
                    set((state) => ({ tarefas: state.tarefas.filter(t => t.id !== tempId) }));
                    return;
                }

                set((state) => ({
                    tarefas: state.tarefas.map(t => t.id === tempId ? retryData : t)
                }));
                return;
            }

            console.error('Error adding task:', error);
            set({ error: error.message });
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
            set({ error: error.message });
            const missingCols = getMissingColumnsFromError(error);
            if (missingCols.length) {
                const retryUpdates = { ...updates };
                missingCols.forEach(col => delete retryUpdates[col]);

                const { error: retryError } = await supabase
                    .from('tarefas')
                    .update(retryUpdates)
                    .eq('id', id);

                if (!retryError) {
                    return;
                }

                console.error('Error updating task (retry)', retryError);
                set({ error: retryError.message });
            } else {
                console.error('Error updating task', error);
            }

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

    moveTarefaHora: async (id, novaHora) => {
        const previousTask = get().tarefas.find(t => t.id === id);
        const previousHora = previousTask.hora_agendada;

        // Fast local mutation
        set((state) => ({
            tarefas: state.tarefas.map(t => t.id === id ? { ...t, hora_agendada: novaHora } : t)
        }));

        const { error } = await supabase
            .from('tarefas')
            .update({ hora_agendada: novaHora })
            .eq('id', id);

        if (error) {
            console.error('Error moving task time', error);
            // Revert
            set((state) => ({
                tarefas: state.tarefas.map(t => t.id === id ? { ...t, hora_agendada: previousHora } : t)
            }));
        }
    },
}));
