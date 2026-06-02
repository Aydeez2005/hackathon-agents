import { FORM_SECTIONS, type FormSectionId } from '../../types/eventForm'

interface SectionProgressNavProps {
  activeSection: FormSectionId
  onNavigate: (sectionId: FormSectionId) => void
  variant: 'sidebar' | 'mobile'
}

export function SectionProgressNav({
  activeSection,
  onNavigate,
  variant,
}: SectionProgressNavProps) {
  if (variant === 'mobile') {
    return (
      <nav className="sticky top-0 z-20 -mx-4 border-b border-gray-200/80 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FORM_SECTIONS.map((section) => {
            const isActive = activeSection === section.id
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onNavigate(section.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {section.number}. {section.label}
              </button>
            )
          })}
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-8 hidden lg:block">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Sections
      </p>
      <ul className="space-y-1">
        {FORM_SECTIONS.map((section) => {
          const isActive = activeSection === section.id
          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => onNavigate(section.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-50 font-medium text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                    isActive ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {section.number}
                </span>
                {section.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
