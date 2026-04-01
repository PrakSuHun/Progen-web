'use client'

interface TagSelectorProps {
  label: string
  tags: string[]
  selectedTags: string[]
  onChange: (tags: string[]) => void
  maxSelect?: number
}

export function TagSelector({ label, tags, selectedTags, onChange, maxSelect }: TagSelectorProps) {
  const handleToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag))
    } else {
      if (maxSelect && selectedTags.length >= maxSelect) return
      onChange([...selectedTags, tag])
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[#333] mb-3">
        {label}
        {maxSelect && (
          <span className="text-[#999] text-xs ml-2">({selectedTags.length}/{maxSelect})</span>
        )}
      </label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleToggle(tag)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedTags.includes(tag)
                ? 'bg-violet-500 text-white shadow-sm'
                : 'bg-[#f0f0f0] text-[#555] hover:bg-violet-50 hover:text-violet-500 border border-[#e0e0e0]'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
