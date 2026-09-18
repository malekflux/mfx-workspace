import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Client, Project, TimeEntry, Service } from '../types';
import { standardServices, refreshCatalog } from '../data/services';
import { nextClientReference, nextProjectReference, normalizeReferences, referenceHighWater } from '../utils/references';
import { uniqueRecords } from '../utils/deduplicate';

interface StoreState {
  referenceCounters: Record<string,number>;
  createClient: (data: Omit<Client,'id'|'refId'>) => Client;
  createProject: (data: Omit<Project,'id'|'refId'>) => Project;
  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Clients
  clients: Client[];
  addClient: (client: Client) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;

  // Projects
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;

  // Time Tracking
  timeEntries: TimeEntry[];
  activeTimeEntry: TimeEntry | null;
  startTimer: (projectId: string, description?: string) => void;
  stopTimer: () => void;

  // Services Catalog
  servicesCatalog: Service[];
  addServiceToCatalog: (service: Service) => void;
  updateServiceInCatalog: (id: string, data: Partial<Service>) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      referenceCounters: {},
      createClient: (data) => { const state=get(); const prefix='MFx-'+String(new Date().getFullYear()).slice(-2); const next=nextClientReference(state.clients,state.referenceCounters[prefix] || 0); const client={...data,id:crypto.randomUUID(),refId:next.refId};set({clients:[...state.clients,client],referenceCounters:{...state.referenceCounters,[prefix]:next.sequence}});return client; },
      createProject: (data) => { const state=get();const client=state.clients.find(c=>c.id===data.clientId);if(!client)throw new Error('Select a valid client.');const key='project:'+client.id;const next=nextProjectReference(client,state.projects,state.referenceCounters[key] || 0);const project={...data,id:crypto.randomUUID(),refId:next.refId};set({projects:[...state.projects,project],referenceCounters:{...state.referenceCounters,[key]:next.sequence}});return project; },
      // Theme
      isDarkMode: false,
      toggleTheme: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }));
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark');
        }
      },

      // Clients
      clients: [],
      addClient: (client) =>
        set((state) => ({
          clients: state.clients.some(c=>c.id===client.id || c.refId===client.refId) ? state.clients : [...state.clients, client],
        })),
      updateClient: (id, data) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),
      deleteClient: (id) =>
        set((state) => ({
          referenceCounters: referenceHighWater(state.clients,state.projects,state.referenceCounters),
          clients: state.clients.filter((c) => c.id !== id),
          projects: state.projects.filter((p) => p.clientId !== id),
          timeEntries: state.timeEntries.filter(e=>!state.projects.some(p=>p.clientId===id&&p.id===e.projectId)),
          activeTimeEntry: state.projects.some(p=>p.clientId===id&&p.id===state.activeTimeEntry?.projectId) ? null : state.activeTimeEntry,
        })),
      getClientById: (id) => get().clients.find((c) => c.id === id),

      // Projects
      projects: [],
      addProject: (project) =>
        set((state) => ({
          projects: state.projects.some(p=>p.id===project.id || p.refId===project.refId) ? state.projects : [...state.projects, project],
        })),
      updateProject: (id, data) =>
        set((state) => {
          const counters=referenceHighWater(state.clients,state.projects,state.referenceCounters);
          const old=state.projects.find(p=>p.id===id);
          const client=state.clients.find(c=>c.id===data.clientId);
          if(old && data.clientId && data.clientId!==old.clientId && !client) throw new Error('Select a valid client.');
          let updated={...data};
          if(old && client && client.id!==old.clientId){const key='project:'+client.id;const next=nextProjectReference(client,state.projects,counters[key] || 0);updated={...data,refId:next.refId};counters[key]=next.sequence;}
          return {referenceCounters:counters,projects:state.projects.map(p=>p.id===id?{...p,...updated}:p)};
        }),
      deleteProject: (id) =>
        set((state) => ({
          referenceCounters: referenceHighWater(state.clients,state.projects,state.referenceCounters),
          projects: state.projects.filter((p) => p.id !== id),
          timeEntries: state.timeEntries.filter(e=>e.projectId!==id),
          activeTimeEntry: state.activeTimeEntry?.projectId === id ? null : state.activeTimeEntry,
        })),
      getProjectById: (id) => get().projects.find((p) => p.id === id),

      // Time Tracking
      timeEntries: [],
      activeTimeEntry: null,
      startTimer: (projectId, description) => {
        if (!get().projects.some(p=>p.id===projectId)) return;
        if (get().activeTimeEntry) get().stopTimer();
        const entry: TimeEntry = {
          id: crypto.randomUUID(),
          projectId,
          startTime: new Date().toISOString(),
          description,
          isActive: true,
        };
        set((state) => ({
          activeTimeEntry: entry,
          timeEntries: [...state.timeEntries, entry],
        }));
      },
      stopTimer: () => {
        const active = get().activeTimeEntry;
        if (!active) return;

        const endTime = new Date().toISOString();
        const duration =
          new Date(endTime).getTime() - new Date(active.startTime).getTime();

        set((state) => ({
          activeTimeEntry: null,
          timeEntries: state.timeEntries.map((entry) =>
            entry.id === active.id
              ? { ...entry, endTime, duration, isActive: false }
              : entry
          ),
        }));
      },

      // Services Catalog
      servicesCatalog: standardServices,
      updateServiceInCatalog: (id, data) => set(state => ({servicesCatalog: state.servicesCatalog.map(s => s.id === id ? {...s,...data} : s)})),
      addServiceToCatalog: (service) =>
        set((state) => ({
          servicesCatalog: [...state.servicesCatalog, service],
        })),
    }),
    {
      name: 'mfx-storage',
      version: 2,
      migrate: (persisted) => {
        const previous = persisted as Pick<StoreState, 'isDarkMode' | 'clients' | 'projects' | 'timeEntries' | 'activeTimeEntry' | 'servicesCatalog' | 'referenceCounters'>;
        // Retain an untouched recovery copy before removing exact duplicate records.
        try {
          localStorage.setItem('mfx-storage-before-v2', JSON.stringify(previous));
          return {...previous,...normalizeReferences(uniqueRecords(previous.clients || []),uniqueRecords(previous.projects || [])),servicesCatalog:refreshCatalog(previous.servicesCatalog || []),referenceCounters:previous.referenceCounters || {},timeEntries:uniqueRecords(previous.timeEntries || [])};
        } catch { return previous; }
      },
      partialize: (state) => ({
        referenceCounters:state.referenceCounters,
        isDarkMode: state.isDarkMode,
        clients: state.clients,
        projects: state.projects,
        timeEntries: state.timeEntries,
        activeTimeEntry: state.activeTimeEntry,
        servicesCatalog: state.servicesCatalog,
      }),
    }
  )
);

// Initialize theme on app load
if (typeof document !== 'undefined') {
  const stored = localStorage.getItem('mfx-storage');
  try { if (stored) {
    const { state } = JSON.parse(stored);
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  } } catch { /* Keep the application accessible if stored JSON is corrupt. */ }
}

