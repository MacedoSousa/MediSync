import type { DataProvenance, HealthTimelineEntry } from "./health-domain";
import { isSyntheticHealthData, type SyntheticDataProvenance } from "./testing/synthetic-health-fixtures";

export interface TimelineViewEntry extends HealthTimelineEntry {
  readonly isSynthetic: boolean;
}

export function buildTimelineView(entries: readonly HealthTimelineEntry[]): TimelineViewEntry[] {
  return [...entries]
    .sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt))
    .map((entry) => ({
      ...entry,
      isSynthetic: isSyntheticHealthData(entry.provenance),
    }));
}

export function provenanceLabel(provenance: DataProvenance | SyntheticDataProvenance): string {
  if (isSyntheticHealthData(provenance)) return "Demonstração MedSync — dado fictício";
  return `${provenance.sourceName} — origem declarada`;
}
