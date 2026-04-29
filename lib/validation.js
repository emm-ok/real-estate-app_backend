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
  step: z.literal(3),

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

    specialization: z
      .array(specializationEnum)
      .min(1, "Select at least one specialization"),

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

    website: z
      .string()
      .trim()
      .optional()
      .nullable()
      .refine(
        (val) => !val || val === "" || /^https?:\/\/.+/.test(val),
        "Website must be a valid URL (include http:// or https://)",
      ),
  }),
});

const step2Schema = z.object({
  step: z.literal(4),
});

const step3Schema = z.object({
  step: z.literal(5),
});

export const stepSchemas = {
  3: step1Schema,
  4: step2Schema,
  5: step3Schema,
};

const companyStep1Schema = z.object({
  step: z.literal(3),

  companyInfo: z.object({
    name: z.string("Company name is required").trim(),
    email: z.email("Invalid email").trim(),
    logo: z.string().trim().optional(),
    website: z
      .string()
      .trim()
      .optional()
      .nullable()
      .refine(
        (val) => !val || val === "" || /^https?:\/\/.+/.test(val),
        "Website must be a valid URL (include http:// or https://)",
      ),
    address: z.string().trim().max(200),
    type: z.string().trim(), // Add enum instead
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
  step: z.literal(4),
});

const companyStep3Schema = z.object({
  step: z.literal(5),
});

export const companyStepSchemas = {
  3: companyStep1Schema,
  4: companyStep2Schema,
  5: companyStep3Schema,
};
