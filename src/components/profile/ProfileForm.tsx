import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import {
  updateProfileInfo,
  updateUserEmail,
  updateUserPassword,
  FormState,
} from '@/app/dashboard/profile/actions';
import { UserProfile } from '@/types/database.types';

// --- Zod Schemas for Client-side Validation ---
const profileInfoSchema = z.object({
  full_name: z.string().min(2, 'Nome completo deve ter pelo menos 2 caracteres.').optional().or(z.literal('')),
  // avatar_url is now optional as it will be handled by file upload
  avatar_file: z.any()
    .refine((file) => !file || file.length === 0 || (file instanceof FileList && file.length > 0), 'Selecione um arquivo de imagem.')
    .refine((file) => !file || file.length === 0 || (file instanceof FileList && file[0].size <= 5 * 1024 * 1024), 'O tamanho máximo da imagem é 5MB.') // 5MB
    .refine((file) => !file || file.length === 0 || (file instanceof FileList && ['image/jpeg', 'image/png', 'image/webp'].includes(file[0].type)), 'Apenas .jpg, .jpeg, .png e .webp são permitidos.')
    .optional(),
});

const emailSchema = z.object({
  email: z.string().email('E-mail inválido.'),
});

const passwordSchema = z.object({
  current_password: z.string().min(6, 'Senha atual deve ter pelo menos 6 caracteres.'),
  new_password: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres.'),
  confirm_new_password: z.string().min(6, 'Confirmação da nova senha deve ter pelo menos 6 caracteres.'),
}).refine((data) => data.new_password === data.confirm_new_password, {
  message: 'As novas senhas não coincidem.',
  path: ['confirm_new_password'],
});

type ProfileInfoFormData = z.infer<typeof profileInfoSchema>;
type EmailFormData = z.infer<typeof emailSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface ProfileFormProps {
  initialProfile: UserProfile;
}

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  // --- State for Server Action Responses ---
  const [profileInfoState, setProfileInfoState] = useState<FormState>({ success: false, message: '' });
  const [emailState, setEmailState] = useState<FormState>({ success: false, message: '' });
  const [passwordState, setPasswordState] = useState<FormState>({ success: false, message: '' });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialProfile.avatar_url || null);

  // --- Form Hooks ---
  const { register: registerProfile, handleSubmit: handleSubmitProfile, watch: watchProfile, formState: { errors: errorsProfile, isSubmitting: isSubmittingProfile } } = useForm<ProfileInfoFormData>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: { full_name: initialProfile.full_name || '', avatar_file: undefined },
  });

  const avatarFile = watchProfile('avatar_file');

  useEffect(() => {
    if (avatarFile && avatarFile.length > 0) {
      const file = avatarFile[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (!initialProfile.avatar_url) {
      setAvatarPreview(null);
    } else if (initialProfile.avatar_url && !avatarFile) {
      setAvatarPreview(initialProfile.avatar_url);
    }
  }, [avatarFile, initialProfile.avatar_url]);

  const { register: registerEmail, handleSubmit: handleSubmitEmail, formState: { errors: errorsEmail, isSubmitting: isSubmittingEmail } } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: initialProfile.email || '' },
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: errorsPassword, isSubmitting: isSubmittingPassword } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  

  // --- Effects for Success/Error Messages and Form Reset ---
  useEffect(() => {
    if (profileInfoState.success) {
      // Optionally reset form or show a toast
      // resetProfile(); // Don't reset, keep current values
    }
  }, [profileInfoState]);

  useEffect(() => {
    if (emailState.success) {
      // Optionally reset form or show a toast
      // resetEmail(); // Don't reset, keep current values
    }
  }, [emailState]);

  useEffect(() => {
    if (passwordState.success) {
      resetPassword(); // Reset password fields on success
    }
  }, [passwordState, resetPassword]);

  // --- Custom Submit Handlers ---
  const onSubmitProfile = async (data: ProfileInfoFormData) => {
    const formData = new FormData();
    formData.append('full_name', data.full_name || '');
    if (data.avatar_file && data.avatar_file.length > 0) {
      formData.append('avatar_file', data.avatar_file[0]);
    }
    const response = await updateProfileInfo(profileInfoState, formData);
    setProfileInfoState(response);
  };

  const onSubmitEmail = async (data: EmailFormData) => {
    const formData = new FormData();
    formData.append('email', data.email);
    const response = await updateUserEmail(emailState, formData);
    setEmailState(response);
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    const formData = new FormData();
    formData.append('current_password', data.current_password);
    formData.append('new_password', data.new_password);
    formData.append('confirm_new_password', data.confirm_new_password);
    const response = await updateUserPassword(passwordState, formData);
    setPasswordState(response);
  };

  return (
    <div className="space-y-8">
      {/* --- Basic Information Section --- */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Informações Básicas</h2>
        <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
            <input type="text" id="full_name" {...registerProfile('full_name')} className="w-full input-style" />
            {errorsProfile.full_name && <p className="text-sm text-red-500 mt-1">{errorsProfile.full_name.message}</p>}
            {profileInfoState.errors?.full_name && <p className="text-sm text-red-500 mt-1">{profileInfoState.errors.full_name[0]}</p>}
          </div>
          <div>
            <label htmlFor="avatar_file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Foto de Perfil</label>
            <div className="flex items-center gap-4">
              {avatarPreview && (
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Image src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" width={96} height={96} />
                </div>
              )}
              <input type="file" id="avatar_file" {...registerProfile('avatar_file')} accept="image/jpeg, image/png, image/webp" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            </div>
            {errorsProfile.avatar_file && <p className="text-sm text-red-500 mt-1">{errorsProfile.avatar_file.message as string}</p>}
            {profileInfoState.errors?.avatar_file && <p className="text-sm text-red-500 mt-1">{profileInfoState.errors.avatar_file[0]}</p>}
          </div>
          {!profileInfoState.success && profileInfoState.message && <p className="text-sm text-red-500 mt-1">{profileInfoState.message}</p>}
          {profileInfoState.success && profileInfoState.message && <p className="text-sm text-green-500 mt-1">{profileInfoState.message}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={isSubmittingProfile} className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50">
              {isSubmittingProfile && <Loader2 className="animate-spin" />} Salvar Informações
            </button>
          </div>
        </form>
      </div>

      {/* --- Email Section --- */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Alterar E-mail</h2>
        <form onSubmit={handleSubmitEmail(onSubmitEmail)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Novo E-mail</label>
            <input type="email" id="email" {...registerEmail('email')} className="w-full input-style" />
            {errorsEmail.email && <p className="text-sm text-red-500 mt-1">{errorsEmail.email.message}</p>}
            {emailState.errors?.email && <p className="text-sm text-red-500 mt-1">{emailState.errors.email[0]}</p>}
          </div>
          {!emailState.success && emailState.message && <p className="text-sm text-red-500 mt-1">{emailState.message}</p>}
          {emailState.success && emailState.message && <p className="text-sm text-green-500 mt-1">{emailState.message}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={isSubmittingEmail} className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50">
              {isSubmittingEmail && <Loader2 className="animate-spin" />} Alterar E-mail
            </button>
          </div>
        </form>
      </div>

      {/* --- Password Section --- */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Alterar Senha</h2>
        <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
          <div>
            <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha Atual</label>
            <input type="password" id="current_password" {...registerPassword('current_password')} className="w-full input-style" />
            {errorsPassword.current_password && <p className="text-sm text-red-500 mt-1">{errorsPassword.current_password.message}</p>}
            {passwordState.errors?.current_password && <p className="text-sm text-red-500 mt-1">{passwordState.errors.current_password[0]}</p>}
          </div>
          <div>
            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nova Senha</label>
            <input type="password" id="new_password" {...registerPassword('new_password')} className="w-full input-style" />
            {errorsPassword.new_password && <p className="text-sm text-red-500 mt-1">{errorsPassword.new_password.message}</p>}
            {passwordState.errors?.new_password && <p className="text-sm text-red-500 mt-1">{passwordState.errors.new_password[0]}</p>}
          </div>
          <div>
            <label htmlFor="confirm_new_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Nova Senha</label>
            <input type="password" id="confirm_new_password" {...registerPassword('confirm_new_password')} className="w-full input-style" />
            {errorsPassword.confirm_new_password && <p className="text-sm text-red-500 mt-1">{errorsPassword.confirm_new_password.message}</p>}
            {passwordState.errors?.confirm_new_password && <p className="text-sm text-red-500 mt-1">{passwordState.errors.confirm_new_password[0]}</p>}
          </div>
          {!passwordState.success && passwordState.message && <p className="text-sm text-red-500 mt-1">{passwordState.message}</p>}
          {passwordState.success && passwordState.message && <p className="text-sm text-green-500 mt-1">{passwordState.message}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={isSubmittingPassword} className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50">
              {isSubmittingPassword && <Loader2 className="animate-spin" />} Alterar Senha
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
