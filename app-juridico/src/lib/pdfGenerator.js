import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

const buildDateRange = (periodo, referenceDate, customRange) => {
    if (customRange?.startDate && customRange?.endDate) {
        return {
            start: new Date(customRange.startDate),
            end: new Date(customRange.endDate),
        };
    }

    if (periodo === 'dia') {
        const [year, month, day] = referenceDate.split('-').map(Number);
        const start = new Date(year, month - 1, day);
        const end = new Date(year, month - 1, day, 23, 59, 59, 999);
        return { start, end };
    }

    const today = new Date(referenceDate);
    if (periodo === 'semana') {
        const start = startOfWeek(today, { weekStartsOn: 1 });
        const end = endOfWeek(today, { weekStartsOn: 1 });
        return { start, end };
    }

    if (periodo === 'mes') {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { start, end };
    }

    // default to dia
    const [year, month, day] = referenceDate.split('-').map(Number);
    const start = new Date(year, month - 1, day);
    const end = new Date(year, month - 1, day, 23, 59, 59, 999);
    return { start, end };
};

let cachedLogoDataUrl = null;
const tryPreloadLogo = () => {
    if (cachedLogoDataUrl) return;
    try {
        const logoUrl = new URL('../images/Josi Pixar + Foca.png', import.meta.url).href;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            cachedLogoDataUrl = canvas.toDataURL('image/png');
        };
        img.src = logoUrl;
    } catch {
        // Ignore any errors; logo is optional
    }
};

export const generateTasksPDF = (tarefas, options = {}) => {
    try {
        const {
            periodo = 'dia',
            referenceDate = new Date(),
            statuses = [],
            customRange,
        } = options;

        const { start, end } = buildDateRange(periodo, referenceDate, customRange);

        const doc = new jsPDF('landscape');

        // Cabeçalho com logo (se já estiver em cache)
        if (cachedLogoDataUrl) {
            doc.addImage(cachedLogoDataUrl, 'PNG', 14, 12, 24, 24);
        }

        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text('Relatório de Processos e Prazos', 44, 22);

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('Dra. Josiane Novaes - Advocacia', 44, 30);
        doc.text(`Período: ${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`, 44, 36);
        doc.text(`Data de emissão: ${format(new Date(), 'dd/MM/yyyy')}`, 44, 42);

        const filtered = tarefas
            .filter((t) => {
                if (!t.prazo) return false;
                if (statuses && statuses.length > 0 && !statuses.includes(t.status)) return false;
                const taskDate = new Date(`${t.prazo}T00:00:00`);
                return isWithinInterval(taskDate, { start, end });
            })
            .sort((a, b) => new Date(a.prazo) - new Date(b.prazo));

        const tableData = filtered.map((t) => [
            t.prazo ? format(new Date(`${t.prazo}T00:00:00`), 'dd/MM/yyyy') : 'Sem Prazo',
            t.cliente || 'N/A',
            t.tarefa || 'N/A',
            t.status || 'N/A',
        ]);

        autoTable(doc, {
            startY: 52,
            head: [['Prazo', 'Cliente', 'Descrição', 'Status']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [79, 70, 229],
                textColor: 255,
                fontStyle: 'bold',
            },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 60 },
                2: { cellWidth: 'auto' },
                3: { cellWidth: 40 },
            },
        });

        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i += 1) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(120);
            doc.text(
                `Página ${i} de ${pageCount}`,
                doc.internal.pageSize.getWidth() - 14,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'right' }
            );
        }

const [year, month, day] = referenceDate.split('-');
    const filenameDate = `${day}_${month}_${year}`;
        doc.save(`relatorio_processos_${periodo}_${filenameDate}.pdf`);

        return { ok: true };
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        return { ok: false, message: error?.message || String(error) };
    }
};

// Preload logo early so download stays within user gesture
tryPreloadLogo();
