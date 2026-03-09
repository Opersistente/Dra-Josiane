import { differenceInDays, startOfDay, parseISO } from 'date-fns';

export function calcularPrioridade(prazo, isUrgente = false) {
    if (isUrgente) return "URGENTE";
    if (!prazo) return "BAIXA";

    const hoje = startOfDay(new Date());
    const dataPrazo = startOfDay(parseISO(prazo));

    const diff = differenceInDays(dataPrazo, hoje);

    if (diff < 0) return "URGENTE";
    if (diff === 0) return "HOJE";
    if (diff <= 3) return "ALTA";
    if (diff <= 7) return "MÉDIA";

    return "BAIXA";
}

export function getPriorityColor(prioridade) {
    switch (prioridade) {
        case "URGENTE": return "bg-red-100 text-red-800 border-red-200";
        case "HOJE": return "bg-orange-100 text-orange-800 border-orange-200";
        case "ALTA": return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "MÉDIA": return "bg-blue-100 text-blue-800 border-blue-200";
        case "BAIXA": return "bg-slate-100 text-slate-800 border-slate-200";
        default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
}
