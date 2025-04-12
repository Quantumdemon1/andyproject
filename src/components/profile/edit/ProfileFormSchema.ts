
import * as z from "zod";

export const ProfileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  displayName: z.string().min(1, {
    message: "Display name is required.",
  }),
  bio: z.string().max(300, {
    message: "Bio cannot exceed 300 characters.",
  }),
  tags: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof ProfileFormSchema>;
