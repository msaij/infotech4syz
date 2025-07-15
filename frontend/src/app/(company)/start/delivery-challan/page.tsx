import DeliveryChallanClient from "@/delivery-challan-components/DeliveryChallanClient";

// Remove server-side prefetch and just render the client component
export default function Page() {
  return <DeliveryChallanClient />;
}
