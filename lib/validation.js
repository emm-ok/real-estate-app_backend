import { z } from "zod";

const specializationEnum = z.enum([
  "RESIDENTIAL",
  "COMMERCIAL",
  "LUXURY",
  "STUDENT",
  "SHORTLET",
  "LAND",
]);

export const step1Schema = z.object({
  step: z.literal(1),

  professional: z.object({
    licenseNumber: z
      .string()
      .min(3, "License number must be at least 3 characters")
      .max(50, "License number is too long")
      .trim(),

    licenseCountry: z
      .string()
      .min(2, "Country is required")
      .max(56, "Country name is too long")
      .trim(),

    specialization: specializationEnum,

    yearsExperience: z
      .number()
      .int("Years of experience must be a whole number")
      .min(0, "Experience cannot be negative")
      .max(40, "Please enter a realistic value"),

    companyName: z
      .string()
      .max(100, "Company name is too long")
      .trim()
      .optional()
      .nullable(),

    website: z.string().url("Invalid website URL").optional().nullable(),
  }),
});

const step2Schema = z.object({
  step: z.literal(2),
});

const step3Schema = z.object({
  step: z.literal(3),
});

export const stepSchemas = {
  1: step1Schema,
  2: step2Schema,
  3: step3Schema,
};

const companyStep1Schema = z.object({
  step: z.literal(2),

  companyInfo: z.object({
    name: z.string("Company name is required").trim(),
    email: z.email("Invalid email"),
    logo: z.string().trim(),
    website: z.string().url("Invalid website URL"),
    address: z.string().max(200),
    type: z.string(), // Add enum instead
    registrationNumber: z
      .string()
      .min(3, "License number must be at least 3 characters")
      .max(50, "License number is too long")
      .trim(),
    licenseNumber: z
      .string()
      .min(3, "License number must be at least 3 characters")
      .max(50, "License number is too long")
      .trim(),
  }),
});

const companyStep2Schema = z.object({
  step: z.literal(2),
});

const companyStep3Schema = z.object({
  step: z.literal(3),
});

export const companyStepSchemas = {
  1: companyStep1Schema,
  2: companyStep2Schema,
  3: companyStep3Schema,
}
