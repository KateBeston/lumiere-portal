"use client";
import { useTransition } from "react";
import { setProjectStage } from "@/app/actions";
import { STAGES } from "@/lib/constants";

export default function StageSelect({ id, stage }: { id: string; stage: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="field">
      <label htmlFor={`stage-${id}`}>Stage {pending && "· saving…"}</label>
      <select
        id={`stage-${id}`}
        defaultValue={stage}
        disabled={pending}
        onChange={(e) => {
          const v = e.target.value;
          start(() => setProjectStage(id, v));
        }}
      >
        {STAGES.map((s) => (
          <option key={s.key} value={s.key}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}
