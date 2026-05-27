import { InsightStudioPage } from "@/components/insights/insight-studio-page";
import { getInsightStudioData } from "@/lib/mock-data";

export default async function InsightsPage() {
  const data = await getInsightStudioData();

  return <InsightStudioPage data={data} />;
}
