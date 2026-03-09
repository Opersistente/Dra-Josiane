import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://dnajtlieksqenvnawgnu.supabase.co',
    'sb_publishable_v9FxjMVpmQRIG-xUJDAfAg_ueamkwNC'
);

async function check() {
    const { data, error } = await supabase.from('tarefas').select('*');
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success, rows:', data.length);
    }
}
check();
