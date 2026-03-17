// Utility to export an array of tasks to a JSON file and trigger download.
export const exportTasksToJson = (tarefas) => {
    if (!Array.isArray(tarefas)) {
        console.warn('exportTasksToJson: espera um array de tarefas.');
        return;
    }

    const jsonContent = JSON.stringify(tarefas, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_tarefas_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};
