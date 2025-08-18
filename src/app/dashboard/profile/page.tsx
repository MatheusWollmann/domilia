// src/app/dashboard/profile/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/profile/ProfileForm';


export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile data from the 'profiles' table
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single();

  // Handle case where profile might not exist (e.g., user signed up before trigger was active)
  if (profileError && profileError.code !== 'PGRST116') {
    console.error("Error fetching profile:", profileError);
    return <div>Error loading profile.</div>;
  }

  const initialProfile = {
    full_name: profileData?.full_name || '',
    avatar_url: profileData?.avatar_url || '',
    email: user.email || '',
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Meu Perfil</h1>
      <p className="text-lg text-gray-500 dark:text-gray-400">Gerencie suas informações pessoais e segurança da conta.</p>
      <ProfileForm initialProfile={initialProfile} />
    </div>
  );
}
