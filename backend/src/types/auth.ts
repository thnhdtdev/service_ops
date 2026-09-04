import { z } from "zod";

export const userRoleSchema = z.enum([
	"admin",
	"staff"
]);

export type UserRole =
	z.infer<typeof userRoleSchema>;