import { useEffect, useState, type ReactNode } from 'react'
import { FORM_SECTIONS, type FormSectionId } from '../../types/eventForm'
import { SectionProgressNav } from './SectionProgressNav'

interface PageLayoutProps {
  children: ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  const [activeSection, setActiveSection] = useState<FormSectionId>('event-basics')

  useEffect(() => {
    const sectionElements = FORM_SECTIONS.map((section) =>
      document.getElementById(section.id),
    ).filter(Boolean) as HTMLElement[]

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id as FormSectionId)
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )

    sectionElements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  const navigateToSection = (sectionId: FormSectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveSection(sectionId)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
      <SectionProgressNav
        variant="mobile"
        activeSection={activeSection}
        onNavigate={navigateToSection}
      />

      <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
        <SectionProgressNav
          variant="sidebar"
          activeSection={activeSection}
          onNavigate={navigateToSection}
        />
        <div className="min-w-0 max-w-3xl space-y-8">{children}</div>
      </div>
    </div>
  )
}
