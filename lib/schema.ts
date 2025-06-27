// Schema types and definitions
import { z } from 'zod';

// Location schema
export const locationSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isApproved: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// User schema
export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
});

// Organization schema
export const organizationSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  tier: z.string(),
});

// Export types
export type Location = z.infer<typeof locationSchema>;
export type User = z.infer<typeof userSchema>;
export type Organization = z.infer<typeof organizationSchema>;