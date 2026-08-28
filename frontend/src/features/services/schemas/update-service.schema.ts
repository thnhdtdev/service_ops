import { z } from "zod";

import { createServiceSchema } from "@/features/services/schemas/create-service.schema";

export const updateServiceSchema = createServiceSchema.extend({
	is_active: z.boolean()
});

export type UpdateServiceSchema = z.infer<typeof updateServiceSchema>;
