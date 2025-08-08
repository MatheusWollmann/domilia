export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      categoriae: {
        Row: {
          budget: number | null
          color: string | null
          created_at: string
          domus_id: string
          icon: string | null
          id: string
          name: string
          type: string
        }
        Insert: {
          budget?: number | null
          color?: string | null
          created_at?: string
          domus_id: string
          icon?: string | null
          id?: string
          name: string
          type: string
        }
        Update: {
          budget?: number | null
          color?: string | null
          created_at?: string
          domus_id?: string
          icon?: string | null
          id?: string
          name?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "categoriae_domus_id_fkey"
            columns: ["domus_id"]
            isOneToOne: false
            referencedRelation: "domus"
            referencedColumns: ["id"]
          },
        ]
      }
      domus: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
      domus_invitationes: {
        Row: {
          created_at: string
          domus_id: string
          id: string
          invitee_email: string
          inviter_id: string
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domus_id: string
          id?: string
          invitee_email: string
          inviter_id: string
          status?: string
          token?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domus_id?: string
          id?: string
          invitee_email?: string
          inviter_id?: string
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "domus_invitationes_domus_id_fkey"
            columns: ["domus_id"]
            isOneToOne: false
            referencedRelation: "domus"
            referencedColumns: ["id"]
          },
        ]
      }
      domus_membra: {
        Row: {
          domus_id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          domus_id: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          domus_id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "domus_membra_domus_id_fkey"
            columns: ["domus_id"]
            isOneToOne: false
            referencedRelation: "domus"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          category_id: string | null
          created_at: string | null
          date: string
          description: string
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          date?: string
          description: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categoriae"
            referencedColumns: ["id"]
          },
        ]
      }
      incomes: {
        Row: {
          amount: number
          category: string | null
          category_id: string | null
          created_at: string | null
          date: string
          description: string
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          date?: string
          description: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incomes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categoriae"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      tarefa_categorias: {
        Row: {
          cor: string | null
          created_at: string
          domus_id: string
          id: string
          nome: string
        }
        Insert: {
          cor?: string | null
          created_at?: string
          domus_id: string
          id?: string
          nome: string
        }
        Update: {
          cor?: string | null
          created_at?: string
          domus_id?: string
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefa_categorias_domus_id_fkey"
            columns: ["domus_id"]
            isOneToOne: false
            referencedRelation: "domus"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefa_tags: {
        Row: {
          created_at: string
          domus_id: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          domus_id: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          domus_id?: string
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefa_tags_domus_id_fkey"
            columns: ["domus_id"]
            isOneToOne: false
            referencedRelation: "domus"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefa_tem_tags: {
        Row: {
          tag_id: string
          tarefa_id: string
        }
        Insert: {
          tag_id: string
          tarefa_id: string
        }
        Update: {
          tag_id?: string
          tarefa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefa_tem_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tarefa_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefa_tem_tags_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas: {
        Row: {
          atribuido_a_id: string | null
          categoria_id: string | null
          created_at: string
          criador_id: string
          data_marcada: string | null
          deadline: string | null
          descricao: string | null
          domus_id: string
          estado: Database["public"]["Enums"]["task_status"]
          id: string
          nome: string
          observacoes: string | null
          updated_at: string
        }
        Insert: {
          atribuido_a_id?: string | null
          categoria_id?: string | null
          created_at?: string
          criador_id: string
          data_marcada?: string | null
          deadline?: string | null
          descricao?: string | null
          domus_id: string
          estado?: Database["public"]["Enums"]["task_status"]
          id?: string
          nome: string
          observacoes?: string | null
          updated_at?: string
        }
        Update: {
          atribuido_a_id?: string | null
          categoria_id?: string | null
          created_at?: string
          criador_id?: string
          data_marcada?: string | null
          deadline?: string | null
          descricao?: string | null
          domus_id?: string
          estado?: Database["public"]["Enums"]["task_status"]
          id?: string
          nome?: string
          observacoes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_atribuido_a_id_fkey"
            columns: ["atribuido_a_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "tarefa_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_criador_id_fkey"
            columns: ["criador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_domus_id_fkey"
            columns: ["domus_id"]
            isOneToOne: false
            referencedRelation: "domus"
            referencedColumns: ["id"]
          },
        ]
      }
      transactiones_recurrentes: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          day_of_month: number | null
          day_of_week: number | null
          description: string
          domus_id: string
          end_date: string | null
          frequency: string
          id: string
          start_date: string
          type: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          description: string
          domus_id: string
          end_date?: string | null
          frequency: string
          id?: string
          start_date: string
          type: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          description?: string
          domus_id?: string
          end_date?: string | null
          frequency?: string
          id?: string
          start_date?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categoriae"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactiones_recurrentes_domus_id_fkey"
            columns: ["domus_id"]
            isOneToOne: false
            referencedRelation: "domus"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_domus_invitation: {
        Args: { p_invitation_id: string; p_user_id: string }
        Returns: undefined
      }
      get_domus_invitations: {
        Args: { p_domus_id: string }
        Returns: {
          created_at: string
          domus_id: string
          id: string
          invitee_email: string
          inviter_id: string
          status: string
          token: string
          updated_at: string
        }[]
      }
      get_domus_members: {
        Args: { p_domus_id: string }
        Returns: {
          user_id: string
          role: string
          user_email: string
          user_full_name: string
          user_avatar_url: string
        }[]
      }
      get_my_pending_invitations: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          domus_id: string
          invitee_email: string
          domus_name: string
          inviter_name: string
        }[]
      }
      is_domus_member: {
        Args: { d_id: string; u_id: string }
        Returns: boolean
      }
      is_domus_owner: {
        Args: { p_domus_id: string; p_user_id: string }
        Returns: boolean
      }
      is_email_in_domus: {
        Args: { p_domus_id: string; p_email: string }
        Returns: boolean
      }
    }
    Enums: {
      task_status: "A Fazer" | "Em Andamento" | "Concluído" | "Bloqueado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      task_status: ["A Fazer", "Em Andamento", "Concluído", "Bloqueado"],
    },
  },
} as const
