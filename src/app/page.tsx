import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { getDashboardOverview } from "@/lib/mock-data";

export default async function HomePage() {
  const overview = await getDashboardOverview();

  return <DashboardPage overview={overview} />;
}
