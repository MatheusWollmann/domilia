export const categories = [
  { value: 'housing', label: '🏠 Moradia', color: '#8B5CF6' },
  { value: 'food', label: '🍕 Alimentação', color: '#EF4444' },
  { value: 'transport', label: '🚗 Transporte', color: '#3B82F6' },
  { value: 'health', label: '💊 Saúde', color: '#10B981' },
  { value: 'entertainment', label: '🎮 Lazer', color: '#F59E0B' },
  { value: 'education', label: '📚 Educação', color: '#6366F1' },
  { value: 'utilities', label: '💡 Utilidades', color: '#14B8A6' },
  { value: 'shopping', label: '🛍️ Compras', color: '#EC4899' },
  { value: 'other', label: '💰 Outros', color: '#6B7280' },
]

export const getCategoryByValue = (value: string) => {
  return categories.find(cat => cat.value === value) || categories[8]
}