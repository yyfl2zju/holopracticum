import { TaskCenterPage } from "@/components/tasks/task-center-page";
import { getTaskCenterMockData } from "@/lib/mock-api";

export default async function TasksPage() {
  const data = await getTaskCenterMockData();

  return <TaskCenterPage data={data} />;
}
