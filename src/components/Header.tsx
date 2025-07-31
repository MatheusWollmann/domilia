'use client';

import { User } from '@supabase/supabase-js';

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  const userName = user.user_metadata.full_name || user.email;
  const userInitial = userName?.[0].toUpperCase() || '?';

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-end px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{userName}</span>
        <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
          {userInitial}
        </div>
      </div>
    </header>
  );
}