import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://dnajtlieksqenvnawgnu.supabase.co',
    'sb_publishable_v9FxjMVpmQRIG-xUJDAfAg_ueamkwNC'
);

async function updateAll() {
    // Get all records first
    const { data: allRecords, error: fetchError } = await supabase
        .from('tarefas')
        .select('id');
    
    if (fetchError) {
        console.error('Fetch error:', fetchError);
        return;
    }

    console.log(`Encontrados ${allRecords.length} registros`);

    // Now update each one
    for (const record of allRecords) {
        const { error } = await supabase
            .from('tarefas')
            .update({ assigned_to_email: 'josiannenovaes@gmail.com' })
            .eq('id', record.id);
        
        if (error) {
            console.error(`Erro ao atualizar ${record.id}:`, error);
        }
    }

    console.log('Atualização concluída!');
    
    // Verify
    const { data, error } = await supabase
        .from('tarefas')
        .select('id')
        .eq('assigned_to_email', 'josiannenovaes@gmail.com');
    
    if (error) {
        console.error('Erro na verificação:', error);
    } else {
        console.log(`Total de registros com o email dela: ${data.length}`);
    }
}

updateAll();
