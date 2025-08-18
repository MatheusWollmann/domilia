import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique filenames

// --- Zod Schemas for Validation ---
const profileInfoSchema = z.object({
  full_name: z.string().min(2, 'Nome completo deve ter pelo menos 2 caracteres.').optional().or(z.literal('')),
  // avatar_file is now optional as it will be handled by file upload
  avatar_file: z.any()
    .refine((file) => !file || file.length === 0 || (file instanceof File && file.size <= 5 * 1024 * 1024), 'O tamanho máximo da imagem é 5MB.') // 5MB
    .refine((file) => !file || file.length === 0 || (file instanceof File && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)), 'Apenas .jpg, .jpeg, .png e .webp são permitidos.')
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

// --- Form State Interface ---
export interface FormState {
  success: boolean;
  message: string;
  errors?: {
    full_name?: string[];
    avatar_file?: string[]; // Changed from avatar_url
    email?: string[];
    current_password?: string[];
    new_password?: string[];
    confirm_new_password?: string[];
  };
}

// --- Server Actions ---

export async function updateProfileInfo(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServerActionClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Usuário não autenticado.' };
  }

  const full_name = formData.get('full_name');
  const avatar_file = formData.get('avatar_file');

  const validatedFields = profileInfoSchema.safeParse({
    full_name: full_name,
    avatar_file: avatar_file,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Por favor, corrija os erros no formulário.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { full_name: validated_full_name, avatar_file: validated_avatar_file } = validatedFields.data;

  let avatar_url: string | null = null;

  try {
    // Handle avatar file upload
    if (validated_avatar_file instanceof File && validated_avatar_file.size > 0) {
      const fileExt = validated_avatar_file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, validated_avatar_file, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return { success: false, message: `Erro ao fazer upload da imagem: ${uploadError.message}` };
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      avatar_url = publicUrlData.publicUrl;
    } else if (validated_avatar_file === null) {
      // If avatar_file is explicitly null, it means user wants to remove current avatar
      avatar_url = null;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: validated_full_name === '' ? null : validated_full_name,
        avatar_url: avatar_url, // Use the uploaded URL or null
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    revalidatePath('/dashboard/profile');
    return { success: true, message: 'Informações do perfil atualizadas com sucesso!' };
  } catch (error: unknown) {
    console.error('Error updating profile info:', error);
    return { success: false, message: `Erro ao atualizar informações do perfil: ${(error as Error).message}` };
  }
}

export async function updateUserEmail(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServerActionClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Usuário não autenticado.' };
  }

  const validatedFields = emailSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Por favor, corrija os erros no formulário.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email } = validatedFields.data;

  try {
    // Supabase handles email change confirmation flow
    const { error } = await supabase.auth.updateUser({ email });

    if (error) throw error;

    revalidatePath('/dashboard/profile');
    return { success: true, message: 'E-mail atualizado com sucesso! Verifique sua caixa de entrada para confirmar.' };
  } catch (error: unknown) {
    console.error('Error updating user email:', error);
    return { success: false, message: `Erro ao atualizar e-mail: ${(error as Error).message}` };
  }
}

export async function updateUserPassword(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServerActionClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Usuário não autenticado.' };
  }

  const validatedFields = passwordSchema.safeParse({
    current_password: formData.get('current_password'),
    new_password: formData.get('new_password'),
    confirm_new_password: formData.get('confirm_new_password'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Por favor, corrija os erros no formulário.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { new_password } = validatedFields.data;

  try {
    // Supabase does not require current password for update, but it's good practice to validate on client
    // The actual password change is handled by Supabase Auth
    const { error } = await supabase.auth.updateUser({ password: new_password });

    if (error) throw error;

    revalidatePath('/dashboard/profile');
    return { success: true, message: 'Senha atualizada com sucesso!' };
  } catch (error: unknown) {
    console.error('Error updating user password:', error);
    return { success: false, message: `Erro ao atualizar senha: ${(error as Error).message}` };
  }
}
