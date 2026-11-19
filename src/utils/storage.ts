import type { GenerationRecord } from '../types/storycraft.ts';

const STORAGE_KEY = 'storycraft_ai_history_v1';

export function loadHistory(): GenerationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as GenerationRecord[];
  } catch {
    return [];
  }
}

export function persistHistory(records: GenerationRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to persist generation history locally:', err);
  }
}

export function createRecordId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `gen_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
