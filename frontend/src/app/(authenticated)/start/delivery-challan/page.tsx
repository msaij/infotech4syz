import DeliveryChallanClient from "@/start/delivery-challan/DeliveryChallanClient";

// Remove server-side prefetch and just render the client component
export default function Page() {
  return <DeliveryChallanClient />;
}
