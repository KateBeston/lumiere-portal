import { clientStatusLabel, stageLabel } from "@/lib/constants";

export function StageBadge({ stage }: { stage: string }) {
  return <span className={`badge badge-${stage}`}>{stageLabel(stage)}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge badge-${status}`}>{clientStatusLabel(status)}</span>;
}
