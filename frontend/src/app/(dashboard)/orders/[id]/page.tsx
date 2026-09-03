import { OrderDetail } from "@/features/orders/components/order-detail";
type OrderDetailPageProps = {
	params: Promise<{
		id: string;
	}>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
	const { id } = await params;

	return <OrderDetail orderId={id} />;
}
