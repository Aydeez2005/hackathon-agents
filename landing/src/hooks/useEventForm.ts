import { useCallback, useState } from 'react'
import { submitEvent } from '../lib/submitEvent'
import {
  createAgendaBlock,
  createFaqItem,
  createInitialFormData,
  type AgendaBlock,
  type EventFormData,
  type FaqItem,
  type MaterialKey,
  type UploadedFile,
} from '../types/eventForm'
import { SUGGESTED_FAQS } from '../constants/suggestedFaqs'
import {
  getFirstErrorSection,
  validateEventForm,
  type FormErrors,
} from '../lib/validation'

export function useEventForm() {
  const [formData, setFormData] = useState<EventFormData>(createInitialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const updateBasics = useCallback(
    <K extends keyof EventFormData['basics']>(field: K, value: EventFormData['basics'][K]) => {
      setFormData((prev) => ({
        ...prev,
        basics: { ...prev.basics, [field]: value },
      }))
    },
    [],
  )

  const updateVenue = useCallback(
    <K extends keyof EventFormData['venue']>(field: K, value: EventFormData['venue'][K]) => {
      setFormData((prev) => ({
        ...prev,
        venue: { ...prev.venue, [field]: value },
      }))
    },
    [],
  )

  const updateFoodDrinks = useCallback(
    <K extends keyof EventFormData['foodDrinks']>(
      field: K,
      value: EventFormData['foodDrinks'][K],
    ) => {
      setFormData((prev) => ({
        ...prev,
        foodDrinks: { ...prev.foodDrinks, [field]: value },
      }))
    },
    [],
  )

  const updateLogistics = useCallback(
    <K extends keyof EventFormData['logistics']>(
      field: K,
      value: EventFormData['logistics'][K],
    ) => {
      setFormData((prev) => ({
        ...prev,
        logistics: { ...prev.logistics, [field]: value },
      }))
    },
    [],
  )

  const updateFinalNotes = useCallback(
    <K extends keyof EventFormData['finalNotes']>(
      field: K,
      value: EventFormData['finalNotes'][K],
    ) => {
      setFormData((prev) => ({
        ...prev,
        finalNotes: { ...prev.finalNotes, [field]: value },
      }))
    },
    [],
  )

  const updateAgendaBlock = useCallback((id: string, updates: Partial<AgendaBlock>) => {
    setFormData((prev) => ({
      ...prev,
      agenda: prev.agenda.map((block) =>
        block.id === id ? { ...block, ...updates } : block,
      ),
    }))
  }, [])

  const addAgendaBlock = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      agenda: [...prev.agenda, createAgendaBlock()],
    }))
  }, [])

  const removeAgendaBlock = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      agenda: prev.agenda.length > 1 ? prev.agenda.filter((block) => block.id !== id) : prev.agenda,
    }))
  }, [])

  const updateFaqItem = useCallback((id: string, updates: Partial<FaqItem>) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }))
  }, [])

  const addFaqItem = useCallback((question = '', answer = '') => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, createFaqItem(question, answer)],
    }))
  }, [])

  const removeFaqItem = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.length > 1 ? prev.faqs.filter((item) => item.id !== id) : prev.faqs,
    }))
  }, [])

  const addSuggestedFaqs = useCallback(() => {
    setFormData((prev) => {
      const existingQuestions = new Set(
        prev.faqs.map((item) => item.question.trim().toLowerCase()).filter(Boolean),
      )
      const newItems = SUGGESTED_FAQS.filter(
        (faq) => !existingQuestions.has(faq.question.toLowerCase()),
      ).map((faq) => createFaqItem(faq.question, faq.answer))

      if (newItems.length === 0) return prev

      const hasEmptyStarter =
        prev.faqs.length === 1 &&
        !prev.faqs[0].question.trim() &&
        !prev.faqs[0].answer.trim()

      return {
        ...prev,
        faqs: hasEmptyStarter ? newItems : [...prev.faqs, ...newItems],
      }
    })
  }, [])

  const setParticipantList = useCallback((file: UploadedFile | null) => {
    setFormData((prev) => ({ ...prev, participantList: file }))
  }, [])

  const setMaterialFile = useCallback((key: MaterialKey, file: UploadedFile | null) => {
    setFormData((prev) => ({
      ...prev,
      additionalMaterials: { ...prev.additionalMaterials, [key]: file },
    }))
  }, [])

  const touchField = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }, [])

  const getError = useCallback(
    (field: string) => (touched[field] || Object.keys(errors).length > 0 ? errors[field] : undefined),
    [errors, touched],
  )

  const validateAndSubmit = useCallback(async () => {
    const result = validateEventForm(formData)
    setErrors(result.errors)
    setTouched(
      Object.fromEntries(Object.keys(result.errors).map((key) => [key, true])),
    )

    if (!result.isValid) {
      const sectionId = getFirstErrorSection(result.errors)
      if (sectionId) {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      return false
    }

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await submitEvent(formData)
      setIsSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return true
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [formData])

  const resetSubmitted = useCallback(() => {
    setIsSubmitted(false)
  }, [])

  return {
    formData,
    errors,
    isSubmitted,
    isSubmitting,
    submitError,
    updateBasics,
    updateVenue,
    updateFoodDrinks,
    updateLogistics,
    updateFinalNotes,
    updateAgendaBlock,
    addAgendaBlock,
    removeAgendaBlock,
    updateFaqItem,
    addFaqItem,
    removeFaqItem,
    addSuggestedFaqs,
    setParticipantList,
    setMaterialFile,
    touchField,
    getError,
    validateAndSubmit,
    resetSubmitted,
  }
}

export type UseEventFormReturn = ReturnType<typeof useEventForm>
