import type { ServiceUnit } from "@/constants/service-unit";

export type Service = {
  id: string;
  name: string;
  unit: ServiceUnit;
  unit_price: number;
  description: string | null;
  is_active: boolean;
};