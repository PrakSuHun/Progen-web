'use client'

interface TagSelectorProps {
  label: string
  tags: string[]
  selectedTags: string[]
  onChange: (tags: string[]) => void
  maxSelect?: number
}

export function TagSelector({
  label,
  tags,
  selectedTags,
  onChange,
  maxSelect,
}: TagSelectorProps) {
  const handleToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag))
    } else {
      if (maxSelect && selectedTags.length >= maxSelect) {
        return
      }
      onChange([...selectedTags, tag])
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-3">
        {label}
        {maxSelect && (
          <span className="text-slate-400 text-xs ml-2">
            ({selectedTags.length}/{maxSelect})
          </span>
        )}
      </label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleToggle(tag)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedTags.includes(tag)
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
