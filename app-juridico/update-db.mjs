import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://dnajtlieksqenvnawgnu.supabase.co',
    'sb_publishable_v9FxjMVpmQRIG-xUJDAfAg_ueamkwNC'
);

async function updateRecords() {
    const { data, error } = await supabase
        .from('tarefas')
        .update({ assigned_to_email: 'josiannenovaes@gmail.com' })
        .neq('assigned_to_email', 'josiannenovaes@gmail.com'); // Update only if not already set

    if (error) {
        console.error('Error updating records:', error);
    } else {
        console.log('Records updated successfully');
    }
}

updateRecords();