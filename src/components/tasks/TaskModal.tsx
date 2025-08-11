'use client';

import { createTask, type TaskFormState } from '@/app/dashboard/tasks/actions';
import { type DomusMember } from '@/app/dashboard/settings/types';
import { Loader2, X } from 'lucide-react';
import React, { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';

type ModalCategory = {
  id: string;
  nome: string;
};

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ModalCategory[];
  members: DomusMember[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-36 items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? <Loader2 size={20} className="animate-spin" /> : 'Criar Tarefa'}
    </button>
  );
}

export default function TaskModal({
  isOpen,
  onClose,
  categories,
  members,
}: TaskModalProps) {
  const initialState: TaskFormState = { success: false, message: '' };
  const [state, formAction] = useActionState(createTask, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      onClose();
      formRef.current?.reset();
    }
  }, [state, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">Nova Tarefa</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20} /></button>
        </div>
        <form ref={formRef} action={formAction} className="p-6 space-y-4 overflow-y-auto">
          {/* Campo Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Tarefa</label>
            <input type="text" name="nome" id="nome" required className="w-full input-style" />
            {state.errors?.nome && <p className="text-sm text-red-500 mt-1">{state.errors.nome[0]}</p>}
          </div>

          {/* Campo Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição (Opcional)</label>
            <textarea name="descricao" id="descricao" rows={3} className="w-full input-style"></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campo Categoria */}
            <div>
              <label htmlFor="categoria_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
              <select name="categoria_id" id="categoria_id" className="w-full input-style">
                <option value="">Nenhuma</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
              </select>
            </div>

            {/* Campo Atribuir a */}
            <div>
              <label htmlFor="atribuido_a_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Atribuir a</label>
              <select name="atribuido_a_id" id="atribuido_a_id" className="w-full input-style">
                <option value="">Ninguém</option>
                {members.map(mem => <option key={mem.user_id} value={mem.user_id}>{mem.users?.raw_user_meta_data?.full_name || mem.users?.email}</option>)}
              </select>
            </div>
          </div>
          
          {/* Campo Deadline */}
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prazo Final (Opcional)</label>
            <input type="date" name="deadline" id="deadline" className="w-full input-style" />
          </div>

          {/* Mensagens de Erro/Sucesso */}
          {!state.success && state.message && <p className="text-sm text-red-500">{state.message}</p>}
          
          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md">Cancelar</button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}