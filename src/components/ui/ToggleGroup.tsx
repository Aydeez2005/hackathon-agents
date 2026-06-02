interface ToggleGroupProps {
  label: string
  value: boolean | null
  onChange: (value: boolean) => void
}

export function ToggleGroup({ label, value, onChange }: ToggleGroupProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>
      <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
        {[true, false].map((option) => {
          const isSelected = value === option
          return (
            <button
              key={String(option)}
              type="button"
              onClick={() => onChange(option)}
              className={`min-w-[4.5rem] rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-white text-brand-700 shadow-sm ring-1 ring-brand-100'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {option ? 'Yes' : 'No'}
            </button>
          )
        })}
      </div>
    </div>
  )
}
