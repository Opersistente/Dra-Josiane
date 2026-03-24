import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://dnajtlieksqenvnawgnu.supabase.co',
    'sb_publishable_v9FxjMVpmQRIG-xUJDAfAg_ueamkwNC'
);

async function updateAll() {
    const { data, error } = await supabase
        .from('tarefas')
        .update({ assigned_to_email: 'josiannenovaes@gmail.com' })
        .is('assigned_to_email', null); // Update only NULL records

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Updated records to:', data?.length || 0);
    }
}

updateAll();
