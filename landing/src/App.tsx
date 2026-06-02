import { HeroSection } from './components/layout/HeroSection'
import { PageLayout } from './components/layout/PageLayout'
import { SuccessState } from './components/success/SuccessState'
import { EventBasicsSection } from './components/sections/EventBasicsSection'
import { VenueSection } from './components/sections/VenueSection'
import { AgendaSection } from './components/sections/AgendaSection'
import { FoodDrinksSection } from './components/sections/FoodDrinksSection'
import { LogisticsSection } from './components/sections/LogisticsSection'
import { FaqSection } from './components/sections/FaqSection'
import { ParticipantUploadSection } from './components/sections/ParticipantUploadSection'
import { AdditionalMaterialsSection } from './components/sections/AdditionalMaterialsSection'
import { FinalNotesSection } from './components/sections/FinalNotesSection'
import { useEventForm } from './hooks/useEventForm'

function App() {
  const form = useEventForm()

  return (
    <div className="min-h-svh bg-gradient-to-br from-[#F8FAFF] via-white to-[#F3F0FF]">
      <HeroSection />

      {form.isSubmitted ? (
        <SuccessState onEdit={form.resetSubmitted} checkinUrl={`${import.meta.env.VITE_APP_URL ?? 'http://localhost:3000'}/checkin`} />
      ) : (
        <PageLayout>
          <EventBasicsSection form={form} />
          <VenueSection form={form} />
          <AgendaSection form={form} />
          <FoodDrinksSection form={form} />
          <LogisticsSection form={form} />
          <FaqSection form={form} />
          <ParticipantUploadSection form={form} />
          <AdditionalMaterialsSection form={form} />
          <FinalNotesSection form={form} />
        </PageLayout>
      )}
    </div>
  )
}

export default App
