// src/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
// Adicionado ClipboardList
import { LayoutDashboard, BarChart3, Settings, LogOut, ArrowRightLeft, ClipboardList } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/tasks', label: 'Tarefas', icon: ClipboardList }, // <-- ADICIONADO
  { href: '/dashboard/analysis', label: 'Análise', icon: BarChart3 },
  { href: '/dashboard/transactions', label: 'Lançamentos', icon: ArrowRightLeft },
  { href: '/dashboard/settings', label: 'Ajustes', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
      <div className="h-16 flex items-center justify-center border-b dark:border-gray-700">
        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Domilia</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
              // Lógica para destacar o link ativo
              pathname === item.href ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="px-4 py-4 border-t dark:border-gray-700">
        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/50 dark:hover:text-red-400 transition-colors">
          <LogOut size={20} />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}