// src/app/dashboard/DashboardUI.tsx
'use client'

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { LogOut, LayoutDashboard, BarChart3, Settings, PieChart, Landmark } from 'lucide-react';
import { type User } from '@supabase/supabase-js';

export default function DashboardUI({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const menuItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Meu Painel' },
    { href: '/dashboard/transactions', icon: BarChart3, label: 'Lançamentos' },
    { href: '/dashboard/analysis', icon: PieChart, label: 'Análise de Fluxo' },
    { href: '/dashboard/settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <div className="flex min-h-screen bg-[#FBFBFA]"> {/* Fundo cor de papel/creme */}
      {/* Barra Lateral / Divisórias do Caderno */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-gray-200">
           <div className="bg-purple-100 text-purple-700 p-2 rounded-lg">
             <Landmark size={24} />
           </div>
           <h1 className="text-xl font-bold text-gray-800 tracking-tighter">Domilia</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            // Verifica se o link é a página atual
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-base font-medium ${
                  isActive
                    ? 'bg-purple-100 text-purple-700' // Estilo de aba ativa
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                    {user.email?.[0].toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
                </div>
            </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}