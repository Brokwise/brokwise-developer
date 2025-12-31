import z from "zod";

// Project Validation Schemas
export const createProjectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  reraNumber: z.string().min(1, "RERA number is required"),
  projectType: z.literal("land"),
  projectUse: z.enum(["residential", "commercial", "agricultural"]),
  legalStatus: z.enum([
    "clear_title",
    "pending_conversion",
    "encumbrance_note",
  ]),
  address: z.object({
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    address: z.string().min(1, "Address is required"),
    pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  }),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([
      z.number().min(-180).max(180),
      z.number().min(-90).max(90),
    ]),
  }),
  possessionDate: z
    .string()
    .datetime()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  description: z.string().min(10, "Description must be at least 10 characters"),
  approvalDocuments: z.array(z.string().url()).optional().default([]),
  images: z.array(z.string().url()).optional().default([]),
  sitePlan: z.string().url().optional(),
  amenities: z.array(z.string()).optional().default([]),
  developmentStatus: z.enum([
    "ready-to-develop",
    "ready-to-move",
    "under-development",
    "phase-info",
  ]),
  totalArea: z.number().positive().optional(),
  totalAreaUnit: z
    .enum(["SQ_FT", "SQ_METER", "SQ_YARDS", "ACRES", "HECTARE", "BIGHA"])
    .optional(),
  priceRange: z
    .object({
      min: z.number().positive(),
      max: z.number().positive(),
    })
    .optional(),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().min(3).optional(),
  reraNumber: z.string().min(1).optional(),
  projectUse: z.enum(["residential", "commercial", "agricultural"]).optional(),
  legalStatus: z
    .enum(["clear_title", "pending_conversion", "encumbrance_note"])
    .optional(),
  address: z
    .object({
      state: z.string().min(1),
      city: z.string().min(1),
      address: z.string().min(1),
      pincode: z.string().regex(/^\d{6}$/),
    })
    .optional(),
  location: z
    .object({
      type: z.literal("Point"),
      coordinates: z.tuple([
        z.number().min(-180).max(180),
        z.number().min(-90).max(90),
      ]),
    })
    .optional(),
  possessionDate: z
    .string()
    .datetime()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .optional(),
  description: z.string().min(10).optional(),
  approvalDocuments: z.array(z.string().url()).optional(),
  images: z.array(z.string().url()).optional(),
  sitePlan: z.string().url().optional(),
  amenities: z.array(z.string()).optional(),
  developmentStatus: z
    .enum([
      "ready-to-develop",
      "ready-to-move",
      "under-development",
      "phase-info",
    ])
    .optional(),
  totalArea: z.number().positive().optional(),
  totalAreaUnit: z
    .enum(["SQ_FT", "SQ_METER", "SQ_YARDS", "ACRES", "HECTARE", "BIGHA"])
    .optional(),
  priceRange: z
    .object({
      min: z.number().positive(),
      max: z.number().positive(),
    })
    .optional(),
});

export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;
