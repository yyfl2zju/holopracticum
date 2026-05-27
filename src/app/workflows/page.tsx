import { WorkflowStudioPage } from "@/components/workflows/workflow-studio-page";
import { getWorkflowStudioMockData } from "@/lib/mock-api";

export default async function WorkflowsPage() {
  const data = await getWorkflowStudioMockData();
  const n8nEditorUrl =
    process.env.NEXT_PUBLIC_N8N_EDITOR_URL ?? process.env.N8N_EDITOR_URL ?? undefined;

  return <WorkflowStudioPage data={data} n8nEditorUrl={n8nEditorUrl} />;
}
