// Utility to export an array of tasks to a CSV file and prompt a download.
// The generated file includes common task fields and can be opened with Excel/Sheets.

const escapeCsvValue = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (/["\n\r,]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

export const exportTasksToCsv = (tarefas) => {
    if (!Array.isArray(tarefas)) {
        console.warn('exportTasksToCsv: espera um array de tarefas.');
        return;
    }

    const headers = ['id', 'cliente', 'tarefa', 'prazo', 'status', 'is_urgente', 'hora_agendada', 'created_at'];

    const rows = tarefas.map((t) =>
        headers
            .map((key) => escapeCsvValue(t[key]))
            .join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_tarefas_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};
