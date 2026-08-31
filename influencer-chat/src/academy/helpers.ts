import { AcademyActivity, AcademyUnit } from "./types";

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesKeywords(
  input: string,
  keywords: string[],
  opts?: { match?: "all" | "any"; requireNumber?: boolean; numberOrKeywords?: boolean },
) {
  const hay = normalizeText(input);
  if (hay.length < 8) return false;
  const hit = (word: string) => hay.includes(normalizeText(word));
  const kwOk = opts?.match === "any" ? keywords.some(hit) : keywords.every(hit);
  if (opts?.numberOrKeywords) return kwOk || /\d/.test(input);
  if (opts?.requireNumber && !/\d/.test(input)) return false;
  return kwOk;
}

export function activityKindLabel(type: AcademyActivity["type"]) {
  switch (type) {
    case "tutorial":
      return "Tutorial";
    case "case":
      return "Caso";
    case "guided":
      return "Paso a paso";
    case "drill":
      return "Práctica";
  }
}

export function unitActivityIds(unit: AcademyUnit) {
  return unit.activities.map((a) => a.id);
}

export function isUnitComplete(unit: AcademyUnit, completedIds: string[]) {
  return unit.activities.every((a) => completedIds.includes(a.id));
}

export function findUnit(units: AcademyUnit[], unitId: string) {
  return units.find((u) => u.id === unitId);
}

export function findActivity(unit: AcademyUnit, activityId: string) {
  return unit.activities.find((a) => a.id === activityId);
}

export function nextActivity(unit: AcademyUnit, activityId: string) {
  const i = unit.activities.findIndex((a) => a.id === activityId);
  return i >= 0 ? unit.activities[i + 1] : undefined;
}

export function nextUnit(units: AcademyUnit[], unitId: string) {
  const i = units.findIndex((u) => u.id === unitId);
  return i >= 0 ? units[i + 1] : undefined;
}

export function progressPercent(units: AcademyUnit[], completedIds: string[]) {
  const total = units.reduce((n, u) => n + u.activities.length, 0);
  if (!total) return 0;
  const done = units.reduce(
    (n, u) => n + u.activities.filter((a) => completedIds.includes(a.id)).length,
    0,
  );
  return Math.round((done / total) * 100);
}
