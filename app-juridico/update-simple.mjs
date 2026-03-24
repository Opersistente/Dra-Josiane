import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://dnajtlieksqenvnawgnu.supabase.co',
    'sb_publishable_v9FxjMVpmQRIG-xUJDAfAg_ueamkwNC'
);

async function updateAll() {
    console.log('Iniciando atualização de todos os registros...');
    
    const { data, error } = await supabase
        .from('tarefas')
        .update({ assigned_to_email: 'josiannenovaes@gmail.com' })
        .gt('id', '');  // Every ID is greater than empty string

    if (error) {
        console.error('Erro na atualização:', error.message);
        console.error('Details:', error.details);
    } else {
        console.log('Atualizado com sucesso!', data);
    }
}

updateAll().catch(err => console.error('Exception:', err));
