import { useSyncExternalStore } from 'react';
import type { AuditEvent, Campaign, CaseStatus, CivicCase, ConsentRecord, Role, Subscription, WorkflowItem } from '@/lib/types';

export interface Preferences {
  theme: 'light' | 'dark'; language: 'en' | 'sw'; saver: boolean; ward: string; consent?: ConsentRecord;
}
export interface SimulationState {
  preferences: Preferences; role?: Role; name?: string; cases: CivicCase[]; saved: string[]; recent: string[];
  subscriptions: Subscription; campaigns: Campaign[]; audit: AuditEvent[]; items: Record<string, WorkflowItem[]>;
  decisions: Record<string, string>; read: string[]; responses: string[]; reminders: string[];
}
export const initial: SimulationState = {
  preferences: { theme: 'light', language: 'en', saver: false, ward: '' },
  cases: [{
    reference: 'LUG-84721', ward: 'mautuma', category: 'Roads', location: 'Example market approach',
    description: 'Heavy rain left a blocked culvert on the approach to the example market.',
    createdAt: '2026-11-18T08:30:00+03:00', status: 'Under review', priority: 'Normal', attachmentCount: 0,
    updates: [
      { status: 'Under review', date: '2026-11-19T10:00:00+03:00', response: 'The demo institution is checking the reported drainage issue.' },
      { status: 'Received', date: '2026-11-18T08:30:00+03:00', response: 'This example report was recorded in the demonstration workspace.' },
    ],
  }], saved: [], recent: [], subscriptions: { channels: [], topics: [], marketing: false },
  campaigns: [], audit: [], items: {}, decisions: {}, read: [], responses: [], reminders: [],
};
export const storageKey = 'lugari-platform:v1';
const changed = 'lugari-storage';
let cachedRaw: string | null = null;
let cachedState = initial;
let volatile = false;

function snapshot(): SimulationState {
  if (volatile) return cachedState;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (cachedRaw === raw) return cachedState;
    cachedRaw = raw;
    cachedState = raw ? { ...initial, ...JSON.parse(raw) } : initial;
    return cachedState;
  } catch {
    return initial;
  }
}

function subscribe(listener: () => void) {
  window.addEventListener('storage', listener);
  window.addEventListener(changed, listener);
  return () => {
    window.removeEventListener('storage', listener);
    window.removeEventListener(changed, listener);
  };
}

export const useSimulation = () => useSyncExternalStore(subscribe, snapshot, () => initial);

export function updateLocal(update: (state: SimulationState) => SimulationState) {
  const next = update(snapshot());
  const raw = JSON.stringify(next);
  try {
    window.localStorage.setItem(storageKey, raw);
  } catch {
    volatile = true;
  }
  cachedRaw = raw;
  cachedState = next;
  window.dispatchEvent(new Event(changed));
}

export function setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
  updateLocal(state => ({ ...state, preferences: { ...state.preferences, [key]: value } }));
}

export function toggleList(key: 'saved' | 'read' | 'responses' | 'reminders', value: string) {
  updateLocal(state => ({
    ...state, [key]: state[key].includes(value) ? state[key].filter(item => item !== value) : [...state[key], value],
  }));
}
export function rememberSearch(query: string) {
  const trimmed = query.trim().slice(0, 100);
  if (trimmed) updateLocal(state => ({ ...state, recent: [trimmed, ...state.recent.filter(item => item !== trimmed)].slice(0, 5) }));
}
export function newId() {
  return globalThis.crypto.randomUUID();
}
function log(state: SimulationState, action: string, resource: string, before?: string) {
  return [
    { id: newId(), actor: state.role ?? 'public demo', action, resource, date: new Date().toISOString(), before },
    ...state.audit,
  ].slice(0, 250);
}
export function submitCase(details: Pick<CivicCase, 'category' | 'ward' | 'location' | 'description' | 'attachmentCount'>) {
  const reference = 'LUG-' + newId().slice(0, 8).toUpperCase();
  const date = new Date().toISOString();
  const entry: CivicCase = { ...details, reference, createdAt: date, status: 'Received',
    updates: [{ status: 'Received', date, response: 'Your report was recorded in this browser.' }],
  };
  updateLocal(state => ({ ...state, cases: [entry, ...state.cases], audit: log(state, 'Recorded report', reference) }));
  return reference;
}
export const caseTrackerUrl = (reference: string) => '/report/status/?reference=' + encodeURIComponent(reference);
export function updateCase(reference: string, changes: Pick<CivicCase, 'status' | 'staff' | 'priority' | 'notes'>, publicResponse: string) {
  updateLocal(state => {
    if (state.role !== 'institution') return state;
    const previous = state.cases.find(item => item.reference === reference);
    if (!previous) return state;
    const status: CaseStatus = changes.status;
    const updates = previous.status !== status || publicResponse
      ? [{ status, date: new Date().toISOString(), response: publicResponse || 'Status updated by the demo institution.' }, ...previous.updates]
      : previous.updates;
    return { ...state, cases: state.cases.map(item => item.reference === reference ? { ...item, ...changes, updates } : item), audit: log(state, 'Updated case: ' + status, reference, previous.status) };
  });
}
export function saveItem(bucket: string, entry: WorkflowItem) {
  updateLocal(state => {
    const current = state.items[bucket] ?? [];
    return { ...state, items: { ...state.items, [bucket]: [entry, ...current.filter(item => item.id !== entry.id)] }, audit: log(state, 'Saved ' + bucket + ' · ' + entry.status, entry.title, current.find(item => item.id === entry.id)?.status) };
  });
}
export function saveCampaign(entry: Campaign) {
  let saved = false;
  updateLocal(state => {
    const previous = state.campaigns.find(campaign => campaign.id === entry.id);
    const starting = !previous || ['Draft', 'Rejected'].includes(previous.status);
    let next: Campaign;
    if (state.role === 'admin' && previous?.status === 'Awaiting approval' && ['Approved', 'Rejected'].includes(entry.status)) {
      next = { ...previous, status: entry.status, date: entry.date };
    } else if (state.role === 'institution' && starting && ['Draft', 'Awaiting approval'].includes(entry.status)) {
      next = entry;
    } else if (state.role === 'institution' && previous && previous.status !== 'Cancelled' && entry.status === 'Cancelled') {
      next = { ...previous, status: 'Cancelled', date: entry.date };
    } else if (state.role === 'institution' && previous?.status === 'Approved' && entry.status === 'Scheduled' &&
        entry.scheduledFor && Date.parse(entry.scheduledFor) > Date.now()) {
      next = { ...previous, scheduledFor: entry.scheduledFor, status: 'Scheduled', date: entry.date };
    } else {
      return state;
    }
    saved = true;
    return {
      ...state, campaigns: [next, ...state.campaigns.filter(campaign => campaign.id !== entry.id)],
      audit: log(state, 'Campaign · ' + next.status, next.title, previous?.status),
    };
  });
  return saved;
}
export function decide(id: string, action: string) {
  updateLocal(state => state.role !== 'admin' ? state : ({
    ...state, decisions: { ...state.decisions, [id]: action }, audit: log(state, action, id, state.decisions[id]),
  }));
}
export function clearLocal() {
  try { window.localStorage.removeItem(storageKey); } catch {}
  volatile = false;
  cachedRaw = null;
  cachedState = initial;
  window.dispatchEvent(new Event(changed));
}
