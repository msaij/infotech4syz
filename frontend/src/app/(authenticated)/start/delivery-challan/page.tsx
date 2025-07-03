import DeliveryChallanClient from "./DeliveryChallanClient";

interface ChallanTableData {
  columns: string[];
  data: Record<string, any>[];
}

// Fetch initial data from the backend (server-side prefetch)
async function fetchInitialChallanData(): Promise<ChallanTableData> {
  const res = await fetch("http://localhost:8001/sse/delivery-challan/initial", { cache: "no-store" });
  if (!res.ok) return { columns: [], data: [] };
  return res.json();
}

export default async function Page() {
  const initialData = await fetchInitialChallanData();
  return <DeliveryChallanClient initialData={initialData} />;
}
