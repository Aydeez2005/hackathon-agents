import { Card } from '../ui/Card'
import { TextArea } from '../ui/TextArea'
import { ToggleGroup } from '../ui/ToggleGroup'
import { SectionHeader } from '../ui/SectionHeader'
import type { UseEventFormReturn } from '../../hooks/useEventForm'

interface FoodDrinksSectionProps {
  form: UseEventFormReturn
}

export function FoodDrinksSection({ form }: FoodDrinksSectionProps) {
  const { formData, updateFoodDrinks } = form
  const { foodDrinks } = formData

  return (
    <section id="food-drinks" className="scroll-mt-28">
      <Card>
        <SectionHeader
          number={4}
          title="Food & Drinks"
          description="Catering details participants will want to know."
        />

        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <ToggleGroup
                label="Will snacks be provided?"
                value={foodDrinks.snacksProvided}
                onChange={(value) => updateFoodDrinks('snacksProvided', value)}
              />
              {foodDrinks.snacksProvided && (
                <TextArea
                  label="Snack details"
                  name="snackDetails"
                  placeholder="Fresh fruit, pastries, and granola bars available during morning breaks."
                  value={foodDrinks.snackDetails}
                  onChange={(event) => updateFoodDrinks('snackDetails', event.target.value)}
                  rows={3}
                />
              )}
            </div>

            <div className="space-y-4">
              <ToggleGroup
                label="Will drinks be provided?"
                value={foodDrinks.drinksProvided}
                onChange={(value) => updateFoodDrinks('drinksProvided', value)}
              />
              {foodDrinks.drinksProvided && (
                <TextArea
                  label="Drink details"
                  name="drinkDetails"
                  placeholder="Coffee, tea, water, and soft drinks available throughout the day."
                  value={foodDrinks.drinkDetails}
                  onChange={(event) => updateFoodDrinks('drinkDetails', event.target.value)}
                  rows={3}
                />
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <TextArea
              label="Meal information"
              name="mealInfo"
              placeholder="Lunch buffet served from 12:30–14:00 in the atrium."
              value={foodDrinks.mealInfo}
              onChange={(event) => updateFoodDrinks('mealInfo', event.target.value)}
              rows={3}
            />
            <TextArea
              label="Dietary options"
              name="dietaryOptions"
              placeholder="Vegetarian, vegan, and gluten-free options available. Please note allergies at registration."
              value={foodDrinks.dietaryOptions}
              onChange={(event) => updateFoodDrinks('dietaryOptions', event.target.value)}
              rows={3}
            />
            <TextArea
              label="Catering timing"
              name="cateringTiming"
              placeholder="Morning coffee from 08:30, lunch at 12:30, afternoon snacks at 15:00."
              value={foodDrinks.cateringTiming}
              onChange={(event) => updateFoodDrinks('cateringTiming', event.target.value)}
              rows={3}
            />
            <TextArea
              label="Notes for participants"
              name="participantNotes"
              placeholder="Please bring your own water bottle. Refill stations are available on every floor."
              value={foodDrinks.participantNotes}
              onChange={(event) => updateFoodDrinks('participantNotes', event.target.value)}
              rows={3}
            />
          </div>
        </div>
      </Card>
    </section>
  )
}
