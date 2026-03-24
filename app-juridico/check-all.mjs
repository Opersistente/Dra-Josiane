import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://dnajtlieksqenvnawgnu.supabase.co',
    'sb_publishable_v9FxjMVpmQRIG-xUJDAfAg_ueamkwNC'
);

async function checkAll() {
    const { data, error } = await supabase
        .from('tarefas')
        .select('id, cliente, tarefa, assigned_to_email, user_id');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Total de registros: ${data.length}`);
        console.log('\nRegistros:', data);
    }
}

checkAll();
