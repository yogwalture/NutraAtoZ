import { getShippingOrders } from "@/lib/adminData";
import AdminShipping from "@/components/admin/AdminShipping";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  const orders = await getShippingOrders();
  return <AdminShipping orders={orders} />;
}
