import { PushNotificationsCard } from "@/features/notifications/components/push-notifications-card";
import { requireAdminPage } from "@/lib/auth/current-user";

export default async function SettingsPage() {
	await requireAdminPage();

	return <PushNotificationsCard />;
}
