import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export const generateTasksPDF = (tarefas) => {
    const doc = new jsPDF('landscape');

    // Título do Documento
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text('Relatório de Processos e Prazos', 14, 22);

    // Subtítulo / Identidade
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Dra. Josiane Novaes - Advocacia', 14, 30);
    doc.text(`Data de Emissão: ${format(new Date(), 'dd/MM/yyyy')}`, 14, 36);

    // Preparar dados para a tabela, apenas tarefas não concluídas, e ordenadas por data
    const tableData = tarefas
        .filter(t => t.status !== 'Concluído' && t.status !== 'Gaveta')
        .sort((a, b) => {
            if (!a.prazo) return 1;
            if (!b.prazo) return -1;
            return new Date(a.prazo) - new Date(b.prazo);
        })
        .map(t => [
            t.cliente || 'N/A',
            t.tarefa || 'N/A',
            t.prazo ? format(new Date(t.prazo + 'T00:00:00'), 'dd/MM/yyyy') : 'Sem Prazo',
            t.status || 'N/A',
            t.is_urgente ? 'SIM' : 'NÃO'
        ]);

    doc.autoTable({
        startY: 42,
        head: [['Cliente / Processo', 'Ação / Tarefa', 'Prazo', 'Status', 'Urgente']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [79, 70, 229], // Indigo 600
            textColor: 255,
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 30 },
            3: { cellWidth: 40 },
            4: { cellWidth: 20, fontStyle: 'bold' },
        },
        didParseCell: function (data) {
            // Pintar de vermelho quem for Urgente
            if (data.section === 'body' && data.column.index === 4 && data.cell.raw === 'SIM') {
                data.cell.styles.textColor = [220, 38, 38]; // Red 600
            }
        }
    });

    // Salvar o arquivo num download nativo
    doc.save(`relatorio_processos_${format(new Date(), 'dd_MM_yyyy')}.pdf`);
};
