// src/schemas/userSchema.ts
import { z } from "zod";

export const userProfileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "user", "guest"], {
    message: "Please select a valid role",
  }),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
