import {
	ServiceMixChart,
	ServiceMixChartSkeleton
} from "@/features/dashboard/components/service-mix-chart";
import { getServiceMixData } from "@/features/dashboard/services/get-service-mix-data";

export async function ServiceMixSection() {
	const result = await getServiceMixData();

	return <ServiceMixChart data={result.data} error={result.error} />;
}

export { ServiceMixChartSkeleton };
