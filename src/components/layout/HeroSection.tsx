import { ArrowDown } from 'lucide-react'
import { Button } from '../ui/Button'

export function HeroSection() {
  const scrollToForm = () => {
    document.getElementById('event-basics')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-12 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/80 px-4 py-1.5 text-sm text-brand-700 shadow-sm backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-brand-500" />
          Event Intelligence Hub
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-[3.25rem] lg:leading-tight">
          Set up your event intelligence hub
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
          Add your event details once. Let AI agents turn them into communication,
          operations, and planning assets.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Button size="lg" onClick={scrollToForm} className="min-w-[240px]">
            Start adding event details
            <ArrowDown className="h-4 w-4" />
          </Button>
          <p className="text-sm text-gray-500">
            Built for organizers who already have the event planned.
          </p>
        </div>
      </div>
    </section>
  )
}
