import type { Repository } from "@/composable/useRepo";

type CIState = "success" | "failure" | "running" | "waiting" | "unknown";

export function getRunState(run: Repository["ci"]): CIState {
  if (run?.status === "completed") {
    switch (run.conclusion) {
      case "success":
        return "success";
      case "failure":
      case "timed_out":
      case "action_required":
        return "failure";
      case "cancelled":
      case "skipped":
      case "stale":
      case "neutral":
        return "unknown";
      default:
        return "unknown";
    }
  }
  switch (run?.status) {
    case "in_progress":
      return "running";
    case "queued":
    case "requested":
    case "waiting":
    case "pending":
      return "waiting";
    default:
      return "unknown";
  }
}
