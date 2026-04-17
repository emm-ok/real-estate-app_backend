import { z } from "zod";

export const updateAgentApplicationSchema = z.object({
  step: z.number().min(1).max(5).optional(),

  professional: z.object({
    licenseNumber: z.string().min(3),
    licenseCountry: z.string(),
    specialization: z.string(),
    yearsExperience: z.number().min(0),
    companyName: z.string().optional(),
    website: z.url().optional(),
  }).optional(),
});