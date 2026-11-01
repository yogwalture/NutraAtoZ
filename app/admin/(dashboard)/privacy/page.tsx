import { getDataRequests } from "@/lib/privacy";
import AdminPrivacy from "@/components/admin/AdminPrivacy";

export const dynamic = "force-dynamic";

export default async function AdminPrivacyPage() {
  const requests = await getDataRequests();
  return <AdminPrivacy requests={requests} />;
}
