import { apiFetch } from "@/lib/api/client";
import type { Service } from "@/features/services/types";

type ServicesResponse = {
  services: Service[];
};

export async function getActiveServices(): Promise<Service[]> {
  const response = await apiFetch("/api/services?active=true");

  if (!response.ok) {
    throw new Error("Không thể tải danh sách dịch vụ.");
  }

  const data = (await response.json()) as ServicesResponse;

  return data.services;
}