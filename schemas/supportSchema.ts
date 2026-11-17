import { z } from "zod";
import { userDetailsResponseSchema } from "./userSchema";

export const supportListItemSchema = z.object({
  id: z.string(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  first_name: z.string(),
  last_name: z.string(),
  is_suspended: z.boolean().optional().default(false),
});

export const supportListResponseSchema = z.object({
  support: z.array(supportListItemSchema),
  total: z.number(),
});

export const createSupportRequestSchema = z
  .object({
    user_id: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  })
  .refine((data) => Boolean(data.user_id?.trim()) || Boolean(data.email?.trim()), {
    message: "Either user_id or email is required",
  });

export const supportActionResponseSchema = z.object({
  status: z.string().optional(),
  message: z.string(),
});

export type SupportListItem = z.infer<typeof supportListItemSchema>;
export type SupportListResponse = z.infer<typeof supportListResponseSchema>;
export type CreateSupportRequest = z.infer<typeof createSupportRequestSchema>;
export type SupportActionResponse = z.infer<typeof supportActionResponseSchema>;
export type SupportDetailResponse = z.infer<typeof userDetailsResponseSchema>;
