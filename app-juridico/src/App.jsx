import React, { useState, useEffect } from 'react';
import { LayoutDashboard, KanbanSquare } from 'lucide-react';
import { supabase } from './lib/supabase';
import josiImage from './images/Josi Pixar + Foca.png';
import Dashboard from './pages/Dashboard';
import Kanban from './pages/Kanban';
import CalendarView from './pages/CalendarView';
import { useTaskStore } from './store/useTaskStore';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const { fetchTarefas, setUser: setStoreUser } = useTaskStore();

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setStoreUser(currentUser);

      if (currentUser) {
        fetchTarefas();
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setStoreUser(currentUser);

      if (currentUser) {
        fetchTarefas();
      }
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, [fetchTarefas, setStoreUser]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Acesse para continuar</h1>
          <p className="text-sm text-slate-500 mb-6">Faça login com sua conta Google para acessar suas tarefas com segurança.</p>
          <button
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            className="w-full inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.35 11.1H12v2.8h5.35c-.25 1.35-1 2.5-2.1 3.25v2.75h3.4c1.95-1.8 3.1-4.45 3.1-7.4 0-.5-.05-1-.15-1.45z" fill="#4285F4"/>
              <path d="M12 22c2.7 0 4.95-.9 6.6-2.45l-3.4-2.75c-.95.65-2.2 1.05-3.2 1.05-2.45 0-4.55-1.65-5.3-3.85H2.1v2.45C3.75 19.9 7.5 22 12 22z" fill="#34A853"/>
              <path d="M6.7 13.8c-.2-.6-.35-1.2-.35-1.8s.15-1.2.35-1.8V7.75H2.1C1.4 9.15 1 10.55 1 12s.4 2.85 1.1 4.25l4.6-2.45z" fill="#FBBC05"/>
              <path d="M12 6.45c1.45 0 2.75.5 3.75 1.5l2.8-2.8C16.95 3.5 14.7 2.5 12 2.5 7.5 2.5 3.75 4.6 2.1 7.75l4.6 2.45c.75-2.2 2.85-3.85 5.3-3.85z" fill="#EA4335"/>
            </svg>
            Entrar com Google
          </button>
          <p className="text-xs text-slate-400 mt-4">Você será redirecionado para autenticação segura.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar / Bottom Nav (Mobile) */}
      <aside className="w-full md:w-64 bg-white border-t md:border-t-0 md:border-r border-slate-200 flex flex-row md:flex-col order-last md:order-first shrink-0 z-50 shadow-md md:shadow-none">
        {/* Header - Hidden on Mobile, Visible on Desktop */}
        <div className="hidden md:flex p-6 border-b border-slate-200 items-center gap-3">
          <img src={josiImage} alt="Dra Josiane" className="w-24 h-24 rounded-xl shadow-md" />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800 leading-tight border-b-2 border-indigo-600 inline-block">Dra Josiane</h1>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Novaes</p>
            <p className="text-xs text-slate-500 mt-1">{user.email}</p>
            <button
              onClick={() => supabase.auth.signOut()}
              className="mt-2 text-xs text-slate-500 hover:text-slate-700"
            >
              Sair
            </button>
          </div>
        </div>

        <nav className="flex-1 flex flex-row md:flex-col justify-around md:justify-start p-2 md:p-4 space-y-0 md:space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 md:w-full flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-xl transition-all ${activeTab === 'dashboard'
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm md:border border-blue-100'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            <LayoutDashboard size={20} />
            <span className="text-[10px] md:text-sm">Painel</span>
          </button>

          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex-1 md:w-full flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-xl transition-all ${activeTab === 'kanban'
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm md:border border-blue-100'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            <KanbanSquare size={20} />
            <span className="text-[10px] md:text-sm">Kanban</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 md:w-full flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-xl transition-all ${activeTab === 'calendar'
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm md:border border-blue-100'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span className="text-[10px] md:text-sm">Calendário</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 pb-safe md:pb-0 h-full">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'kanban' && <Kanban />}
        {activeTab === 'calendar' && <CalendarView />}
      </main>
    </div>
  );
}

export default App;
