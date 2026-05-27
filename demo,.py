def get_execution_stats(self) -> Dict:
        total_tasks = len(self.tasks)
        completed = len(self.completed_tasks)
        failed = len(self.failed_tasks)
        pending = total_tasks - completed - failed
        total_time_ms = sum(t.execution_time_ms for t in self.tasks.values())
        return {
            "total_tasks": total_tasks,
            "completed": completed,
            "failed": failed,
            "pending": pending,
            "success_rate": completed / total_tasks if total_tasks > 0 else 0,
            "total_execution_time_ms": total_time_ms,
            "average_task_time_ms": total_time_ms / completed if completed > 0 else 0
        }