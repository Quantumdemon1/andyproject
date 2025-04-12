
import * as z from "zod";

export const ProfileFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters." })
    .max(30, { message: "Username cannot exceed 30 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores.",
    }),
  displayName: z
    .string()
    .min(2, { message: "Display name must be at least 2 characters." })
    .max(50, { message: "Display name cannot exceed 50 characters." }),
  bio: z.string().max(300, {
    message: "Bio cannot exceed 300 characters.",
  }),
  tags: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof ProfileFormSchema>;
