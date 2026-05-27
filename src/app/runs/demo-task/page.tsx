import { RunDetailPage } from "@/components/runs/run-detail-page";
import { getDemoTaskRunMockData } from "@/lib/mock-api";

export default async function DemoTaskRunPage() {
  const data = await getDemoTaskRunMockData();

  return <RunDetailPage data={data} />;
}
