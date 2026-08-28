import {z} from "zod"

export const customerLookupSchema = z.object({
    phone: z.string().trim().min(1,"Số điện thoại không được để trống")
}) 