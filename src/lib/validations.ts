import { z } from 'zod'

// Type for the translation function passed to schema factories
type T = (key: string) => string

export function createSignUpSchema(t: T) {
  return z.object({
    name: z.string().min(2, t('nameMin')),
    email: z.email(t('emailInvalid')),
    password: z.string().min(8, t('passwordMin')),
  })
}

export function createLoginSchema(t: T) {
  return z.object({
    email: z.email(t('emailInvalid')),
    password: z.string().min(1, t('passwordRequired')),
  })
}

export function createItemSchema(t: T) {
  return z.object({
    title: z.string().min(3, t('titleMin')).max(100, t('titleMax')),
    description: z.string().min(10, t('descriptionMin')).max(2000, t('descriptionMax')),
    category_id: z.uuid(t('categoryRequired')),
    price_per_day: z.coerce.number().min(1, t('priceMin')).max(10000, t('priceMax')),
    city: z.string().min(2, t('cityRequired')),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
  })
}

export function createProfileSchema(t: T) {
  return z.object({
    name: z.string().min(2, t('nameMin')),
    // Location is managed via SearchLocation state, not a form field
  })
}

// Static schemas kept for API routes / server-side usage (no translation needed)
export const signUpSchema = createSignUpSchema((k) => k)
export const loginSchema = createLoginSchema((k) => k)
export const itemSchema = createItemSchema((k) => k)
export const profileSchema = createProfileSchema((k) => k)

export const bookingSchema = z
  .object({
    item_id: z.uuid(),
    start_date: z.string().refine((date) => new Date(date) >= new Date(), {
      message: 'Start date must be in the future',
    }),
    end_date: z.string(),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: 'End date must be after start date',
    path: ['end_date'],
  })

export const messageSchema = z.object({
  conversation_id: z.uuid(),
  message: z.string().min(1).max(2000),
})

export type SignUpInput = z.infer<ReturnType<typeof createSignUpSchema>>
export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>
/** Form field values (before validation); use with useForm first type param when using zodResolver + coerce */
export type ItemFormInput = z.input<ReturnType<typeof createItemSchema>>
/** Validated/submitted shape (after resolver); use for onSubmit and useForm third type param */
export type ItemInput = z.infer<ReturnType<typeof createItemSchema>>
export type BookingInput = z.infer<typeof bookingSchema>
export type MessageInput = z.infer<typeof messageSchema>
export type ProfileInput = z.infer<ReturnType<typeof createProfileSchema>>
