import { ContentStudioPage } from "@/components/content/content-studio-page";
import { getContentStudioData } from "@/lib/mock-data";

export default async function ContentPage() {
  const data = await getContentStudioData();

  return <ContentStudioPage data={data} />;
}
