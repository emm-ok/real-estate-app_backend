import z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Enter a valid email address")
    .transform(v => v.toLowerCase().trim()),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});


export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .transform(v => v.trim()),
  email: z
    .string()
    .email("Enter a valid email address")
    .transform(v => v.toLowerCase().trim()),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  });

  export const updateUserSchema = z.object({
    name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .transform(v => v.trim()).optional(),
    phone: z
    .coerce.number("Phone must be a number")
    .min(10, "Enter a valid phone number").optional(),
    bio: z
    .string()
    .trim()
    .min(10, "Minimum 10 characters")
    .max(1000, "Max 1000 characters").optional(),
    address: z
    .string()
    .trim()
    .min(2, "Minimum 2 characters")
    .max(50, "Max 50 characters").optional(),
    city: z
    .string()
    .min(2, "Minimum 2 characters")
    .max(50, "Max 50 characters"),
    state: z
    .string()
    .min(2, "Minimum 2 characters")
    .max(50, "Max 50 characters"),
    country: z
    .string()
    .min(2, "Minimum 2 characters")
    .max(50, "Max 50 characters"),
  })
