import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://dnajtlieksqenvnawgnu.supabase.co',
    'sb_publishable_v9FxjMVpmQRIG-xUJDAfAg_ueamkwNC'
);

async function verify() {
    // Check how many records have the email
    const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .eq('assigned_to_email', 'josiannenovaes@gmail.com');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Total de registros com o email josiannenovaes@gmail.com: ${data.length}`);
        if (data.length > 0) {
            console.log('Primeiros registros:', data.slice(0, 3));
        }
    }
}

verify();
