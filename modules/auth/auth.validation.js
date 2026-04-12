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
