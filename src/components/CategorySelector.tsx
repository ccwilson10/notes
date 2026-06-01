import { useCategoriesStore } from '../stores/categories'
import { CategoryDot } from './CategoryDot'
import { X } from 'lucide-react'

type Props = {
  value: string | null
  onChange: (categoryId: string | null) => void
}

export function CategorySelector({ value, onChange }: Props) {
  const categories = useCategoriesStore((s) => s.categories)

  if (categories.length === 0) return null

  return (
    <div className="flex items-center gap-1.5">
      <label className="text-[11px] text-text-tertiary uppercase tracking-wide">Category</label>
      <div className="flex items-center gap-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onChange(value === cat.id ? null : cat.id)}
            title={cat.name}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[12px] transition-colors duration-150 cursor-pointer ${
              value === cat.id
                ? 'bg-surface-hover text-text'
                : 'text-text-secondary hover:bg-surface'
            }`}
          >
            <CategoryDot color={cat.color} size={6} />
            {cat.name}
          </button>
        ))}
        {value && (
          <button
            onClick={() => onChange(null)}
            className="flex items-center justify-center w-5 h-5 rounded-md text-text-tertiary hover:bg-surface-hover transition-colors duration-150 cursor-pointer"
            title="Remove category"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
