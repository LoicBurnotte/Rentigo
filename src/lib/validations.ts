import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const itemSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000),
  category_id: z.string().uuid("Please select a category"),
  price_per_day: z.coerce
    .number()
    .min(1, "Price must be at least 1")
    .max(10000),
  city: z.string().min(2, "City is required"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

export const bookingSchema = z
  .object({
    item_id: z.string().uuid(),
    start_date: z.string().refine((date) => new Date(date) >= new Date(), {
      message: "Start date must be in the future",
    }),
    end_date: z.string(),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: "End date must be after start date",
    path: ["end_date"],
  });

export const messageSchema = z.object({
  conversation_id: z.string().uuid(),
  message: z.string().min(1, "Message cannot be empty").max(2000),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  location: z.string().optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ItemInput = z.infer<typeof itemSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
