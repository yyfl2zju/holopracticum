import { DevelopmentAssistantPage } from "@/components/development/development-assistant-page";
import { getDevelopmentAssistantData } from "@/lib/mock-data";

export default async function DevelopmentPage() {
  const data = await getDevelopmentAssistantData();

  return <DevelopmentAssistantPage data={data} />;
}
