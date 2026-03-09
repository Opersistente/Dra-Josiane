import React, { useState, useEffect } from 'react';
import { LayoutDashboard, KanbanSquare, Scale } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Kanban from './pages/Kanban';
import CalendarView from './pages/CalendarView';
import { useTaskStore } from './store/useTaskStore';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { fetchTarefas } = useTaskStore();

  useEffect(() => {
    fetchTarefas();
  }, [fetchTarefas]);

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 shadow-md flex items-center justify-center text-white">
            <Scale size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800 leading-tight border-b-2 border-indigo-600 inline-block">Dra Josiane</h1>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Novaes</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard'
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm border border-blue-100'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            <LayoutDashboard size={20} />
            Visão Geral
          </button>

          <button
            onClick={() => setActiveTab('kanban')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'kanban'
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm border border-blue-100'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            <KanbanSquare size={20} />
            Quadro Kanban
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'calendar'
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm border border-blue-100'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Calendário
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-x-hidden overflow-y-auto bg-slate-50/50">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'kanban' && <Kanban />}
        {activeTab === 'calendar' && <CalendarView />}
      </main>
    </div>
  );
}

export default App;
