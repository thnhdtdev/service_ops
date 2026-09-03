import { CustomerDetail } from "@/features/customers/components/customer-detail";

type CustomerDetailPageProps = {
	params: Promise<{
		id: string;
	}>;
};

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
	const { id } = await params;

	return <CustomerDetail customerId={id} />;
}
