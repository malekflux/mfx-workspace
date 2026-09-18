// src/store/useStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// src/data/services.ts
var standardServices = [
  {
    "id": "svc_social_media",
    "name": "Social Media Management",
    "nameAr": "\u0625\u062F\u0627\u0631\u0629 \u0645\u0646\u0635\u0627\u062A \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A",
    "subServices": [
      "Daily scheduled posting",
      "Active community moderation",
      "Unified visual identity",
      "Monthly performance reporting"
    ],
    "subServicesAr": [
      "\u0646\u0634\u0631 \u064A\u0648\u0645\u064A \u0645\u062C\u062F\u0648\u0644",
      "\u0625\u062F\u0627\u0631\u0629 \u0646\u0634\u0637\u0629 \u0644\u0644\u0645\u062C\u062A\u0645\u0639",
      "\u0647\u0648\u064A\u0629 \u0628\u0635\u0631\u064A\u0629 \u0645\u0648\u062D\u0651\u062F\u0629",
      "\u062A\u0642\u0627\u0631\u064A\u0631 \u0623\u062F\u0627\u0621 \u0634\u0647\u0631\u064A\u0629"
    ],
    "basePrice": 0
  },
  {
    "id": "svc_web_dev",
    "name": "Web Design & Development",
    "nameAr": "\u062A\u0635\u0645\u064A\u0645 \u0648\u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0645\u0648\u0627\u0642\u0639",
    "subServices": [
      "Custom UI/UX design",
      "Responsive web development",
      "Payment gateway integration",
      "Technical speed optimization"
    ],
    "subServicesAr": [
      "\u062A\u0635\u0645\u064A\u0645 \u0645\u062E\u0635\u0635 \u0644\u0648\u0627\u062C\u0647\u0629 \u0648\u062A\u062C\u0631\u0628\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645",
      "\u062A\u0637\u0648\u064A\u0631 \u0645\u0648\u0627\u0642\u0639 \u0645\u062A\u062C\u0627\u0648\u0628\u0629",
      "\u062A\u0643\u0627\u0645\u0644 \u0628\u0648\u0627\u0628\u0627\u062A \u0627\u0644\u062F\u0641\u0639",
      "\u062A\u062D\u0633\u064A\u0646 \u0633\u0631\u0639\u0629 \u0627\u0644\u0645\u0648\u0642\u0639 \u062A\u0642\u0646\u064A\u064B\u0627"
    ],
    "basePrice": 0
  },
  {
    "id": "svc_branding",
    "name": "Branding & Identity",
    "nameAr": "\u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0648\u0627\u0644\u0647\u0648\u064A\u0629",
    "subServices": [
      "Complete logo suite",
      "Full typography system",
      "Comprehensive brand guidelines",
      "Business stationery design"
    ],
    "subServicesAr": [
      "\u0645\u062C\u0645\u0648\u0639\u0629 \u0634\u0639\u0627\u0631\u0627\u062A \u0645\u062A\u0643\u0627\u0645\u0644\u0629",
      "\u0646\u0638\u0627\u0645 \u062E\u0637\u0648\u0637 \u0643\u0627\u0645\u0644",
      "\u062F\u0644\u064A\u0644 \u0634\u0627\u0645\u0644 \u0644\u0644\u0647\u0648\u064A\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629",
      "\u062A\u0635\u0645\u064A\u0645 \u0627\u0644\u0645\u0637\u0628\u0648\u0639\u0627\u062A \u0627\u0644\u0645\u0624\u0633\u0633\u064A\u0629"
    ],
    "basePrice": 0
  },
  {
    "id": "svc_ads",
    "name": "Media Buying & Performance Marketing",
    "nameAr": "\u0634\u0631\u0627\u0621 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062A \u0648\u0627\u0644\u062A\u0633\u0648\u064A\u0642 \u0628\u0627\u0644\u0623\u062F\u0627\u0621",
    "subServices": [
      "Multi-platform campaign setup",
      "Precise audience targeting",
      "Continuous ad optimization",
      "Actionable ROAS tracking"
    ],
    "subServicesAr": [
      "\u0625\u0639\u062F\u0627\u062F \u0627\u0644\u062D\u0645\u0644\u0627\u062A \u0639\u0628\u0631 \u0645\u0646\u0635\u0627\u062A \u0645\u062A\u0639\u062F\u062F\u0629",
      "\u0627\u0633\u062A\u0647\u062F\u0627\u0641 \u062F\u0642\u064A\u0642 \u0644\u0644\u062C\u0645\u0647\u0648\u0631",
      "\u062A\u062D\u0633\u064A\u0646 \u0645\u0633\u062A\u0645\u0631 \u0644\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062A",
      "\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0639\u0627\u0626\u062F \u0639\u0644\u0649 \u0627\u0644\u0625\u0646\u0641\u0627\u0642 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u064A \u0644\u0627\u062A\u062E\u0627\u0630 \u0642\u0631\u0627\u0631\u0627\u062A \u0639\u0645\u0644\u064A\u0629"
    ],
    "basePrice": 0
  },
  {
    "id": "svc_seo",
    "name": "Search Engine Optimization (SEO)",
    "nameAr": "\u062A\u062D\u0633\u064A\u0646 \u0645\u062D\u0631\u0643\u0627\u062A \u0627\u0644\u0628\u062D\u062B",
    "subServices": [
      "In-depth keyword research",
      "Full on-page optimization",
      "Technical website audits",
      "Quality backlink building"
    ],
    "subServicesAr": [
      "\u0628\u062D\u062B \u0645\u062A\u0639\u0645\u0642 \u0644\u0644\u0643\u0644\u0645\u0627\u062A \u0627\u0644\u0645\u0641\u062A\u0627\u062D\u064A\u0629",
      "\u062A\u062D\u0633\u064A\u0646 \u0634\u0627\u0645\u0644 \u062F\u0627\u062E\u0644 \u0627\u0644\u0635\u0641\u062D\u0627\u062A",
      "\u0645\u0631\u0627\u062C\u0639\u0629 \u062A\u0642\u0646\u064A\u0629 \u0644\u0644\u0645\u0648\u0642\u0639",
      "\u0628\u0646\u0627\u0621 \u0631\u0648\u0627\u0628\u0637 \u062E\u0644\u0641\u064A\u0629 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u062C\u0648\u062F\u0629"
    ],
    "basePrice": 0
  },
  {
    "id": "svc_video",
    "name": "Creative Production",
    "nameAr": "\u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0627\u0644\u0625\u0628\u062F\u0627\u0639\u064A",
    "subServices": [
      "Short-form video editing",
      "High-converting ad copy",
      "Custom motion graphics",
      "Promotional poster design"
    ],
    "subServicesAr": [
      "\u0645\u0648\u0646\u062A\u0627\u062C \u0641\u064A\u062F\u064A\u0648\u0647\u0627\u062A \u0642\u0635\u064A\u0631\u0629",
      "\u0643\u062A\u0627\u0628\u0629 \u0625\u0639\u0644\u0627\u0646\u064A\u0629 \u0645\u0648\u062C\u0647\u0629 \u0644\u0644\u062A\u062D\u0648\u064A\u0644",
      "\u0645\u0648\u0634\u0646 \u062C\u0631\u0627\u0641\u064A\u0643 \u0645\u062E\u0635\u0635",
      "\u062A\u0635\u0645\u064A\u0645 \u0645\u0644\u0635\u0642\u0627\u062A \u062A\u0631\u0648\u064A\u062C\u064A\u0629"
    ],
    "basePrice": 0
  },
  {
    "id": "svc_photography",
    "name": "Commercial Photography",
    "nameAr": "\u0627\u0644\u062A\u0635\u0648\u064A\u0631 \u0627\u0644\u062A\u062C\u0627\u0631\u064A",
    "subServices": [
      "Studio product photography",
      "Commercial lifestyle shoots",
      "High-end image retouching",
      "Ready-to-publish export assets"
    ],
    "subServicesAr": [
      "\u062A\u0635\u0648\u064A\u0631 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u062F\u0627\u062E\u0644 \u0627\u0644\u0627\u0633\u062A\u0648\u062F\u064A\u0648",
      "\u062C\u0644\u0633\u0627\u062A \u062A\u0635\u0648\u064A\u0631 \u062A\u062C\u0627\u0631\u064A\u0629 \u0644\u0623\u0633\u0644\u0648\u0628 \u0627\u0644\u062D\u064A\u0627\u0629",
      "\u0645\u0639\u0627\u0644\u062C\u0629 \u0635\u0648\u0631 \u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629",
      "\u062A\u0635\u062F\u064A\u0631 \u0645\u0644\u0641\u0627\u062A \u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u0646\u0634\u0631"
    ],
    "basePrice": 0
  },
  {
    "id": "svc_consulting",
    "name": "Digital Consulting",
    "nameAr": "\u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u0631\u0642\u0645\u064A\u0629",
    "subServices": [
      "Digital footprint audit",
      "Go-to-market strategic roadmap",
      "Competitive market analysis",
      "Actionable advisory sessions"
    ],
    "subServicesAr": [
      "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u062D\u0636\u0648\u0631 \u0627\u0644\u0631\u0642\u0645\u064A",
      "\u062E\u0627\u0631\u0637\u0629 \u0637\u0631\u064A\u0642 \u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629 \u0644\u062F\u062E\u0648\u0644 \u0627\u0644\u0633\u0648\u0642",
      "\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0633\u0648\u0642 \u0648\u0627\u0644\u0645\u0646\u0627\u0641\u0633\u064A\u0646",
      "\u062C\u0644\u0633\u0627\u062A \u0627\u0633\u062A\u0634\u0627\u0631\u064A\u0629 \u0628\u062E\u0637\u0648\u0627\u062A \u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u062A\u0646\u0641\u064A\u0630"
    ],
    "basePrice": 0
  },
  {
    "id": "svc_business",
    "name": "Marketing & Business Development",
    "nameAr": "\u0627\u0644\u062A\u0633\u0648\u064A\u0642 \u0648\u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0623\u0639\u0645\u0627\u0644",
    "subServices": [
      "Sales funnel architecture",
      "Strategic partnership mapping",
      "Acquisition channel expansion",
      "Revenue growth modeling"
    ],
    "subServicesAr": [
      "\u062A\u0635\u0645\u064A\u0645 \u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A",
      "\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u0634\u0631\u0627\u0643\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629",
      "\u062A\u0648\u0633\u064A\u0639 \u0642\u0646\u0648\u0627\u062A \u0627\u0643\u062A\u0633\u0627\u0628 \u0627\u0644\u0639\u0645\u0644\u0627\u0621",
      "\u0646\u0645\u0630\u062C\u0629 \u0646\u0645\u0648 \u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A"
    ],
    "basePrice": 0
  },
  {
    "id": "svc_crm",
    "name": "CRM & ERP Solutions",
    "nameAr": "\u062D\u0644\u0648\u0644 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u0645\u0648\u0627\u0631\u062F \u0627\u0644\u0645\u0624\u0633\u0633\u0629",
    "subServices": [
      "Centralized CRM configuration",
      "Full ERP integration",
      "Automated sales pipeline",
      "Internal staff training"
    ],
    "subServicesAr": [
      "\u0625\u0639\u062F\u0627\u062F \u0646\u0638\u0627\u0645 \u0645\u0631\u0643\u0632\u064A \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621",
      "\u062A\u0643\u0627\u0645\u0644 \u0643\u0627\u0645\u0644 \u0644\u0646\u0638\u0627\u0645 \u0645\u0648\u0627\u0631\u062F \u0627\u0644\u0645\u0624\u0633\u0633\u0629",
      "\u0623\u062A\u0645\u062A\u0629 \u0645\u0631\u0627\u062D\u0644 \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A",
      "\u062A\u062F\u0631\u064A\u0628 \u0641\u0631\u064A\u0642 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u062F\u0627\u062E\u0644\u064A"
    ],
    "basePrice": 0
  },
  {
    "id": "svc_cro",
    "name": "CRO & Workflow Automation",
    "nameAr": "\u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0648\u0623\u062A\u0645\u062A\u0629 \u0633\u064A\u0631 \u0627\u0644\u0639\u0645\u0644",
    "subServices": [
      "A/B split testing",
      "Frictionless checkout audit",
      "Cross-platform workflow integration",
      "Automated message sequences"
    ],
    "subServicesAr": [
      "\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0642\u0627\u0631\u0646\u0629 A/B",
      "\u0645\u0631\u0627\u062C\u0639\u0629 \u0633\u0644\u0627\u0633\u0629 \u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0634\u0631\u0627\u0621",
      "\u062A\u0643\u0627\u0645\u0644 \u0633\u064A\u0631 \u0627\u0644\u0639\u0645\u0644 \u0639\u0628\u0631 \u0627\u0644\u0645\u0646\u0635\u0627\u062A",
      "\u0633\u0644\u0627\u0633\u0644 \u0631\u0633\u0627\u0626\u0644 \u0622\u0644\u064A\u0629"
    ],
    "basePrice": 0
  },
  {
    "id": "svc_vip",
    "name": "VIP Package (Turnkey Executive Management)",
    "nameAr": "\u0628\u0627\u0642\u0629 VIP \u2014 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062A\u0646\u0641\u064A\u0630\u064A\u0629 \u0627\u0644\u0645\u062A\u0643\u0627\u0645\u0644\u0629",
    "subServices": [
      "Full-service operational execution",
      "Dedicated account director",
      "Unified cross-channel strategy",
      "Priority quarterly roadmaps"
    ],
    "subServicesAr": [
      "\u062A\u0646\u0641\u064A\u0630 \u062A\u0634\u063A\u064A\u0644\u064A \u0634\u0627\u0645\u0644 \u0644\u0644\u062E\u062F\u0645\u0627\u062A",
      "\u0645\u062F\u064A\u0631 \u062D\u0633\u0627\u0628 \u0645\u062E\u0635\u0635",
      "\u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629 \u0645\u0648\u062D\u0651\u062F\u0629 \u0639\u0628\u0631 \u0627\u0644\u0642\u0646\u0648\u0627\u062A",
      "\u062E\u0631\u0627\u0626\u0637 \u0637\u0631\u064A\u0642 \u0631\u0628\u0639 \u0633\u0646\u0648\u064A\u0629 \u0630\u0627\u062A \u0623\u0648\u0644\u0648\u064A\u0629"
    ],
    "basePrice": 0
  }
];
function refreshCatalog(existing) {
  return [...standardServices.map((s) => ({ ...s, basePrice: existing.find((old) => old.id === s.id)?.basePrice ?? 0 })), ...existing.filter((s) => !standardServices.some((standard) => standard.id === s.id))];
}

// src/utils/references.ts
function nextClientReference(clients, last = 0, year = (/* @__PURE__ */ new Date()).getFullYear()) {
  const prefix = `MFx-${String(year).slice(-2)}`;
  const highest = clients.reduce((max, c) => {
    const suffix = c.refId.startsWith(prefix) ? c.refId.slice(prefix.length) : "";
    return /^\d{3,}$/.test(suffix) ? Math.max(max, Number(suffix)) : max;
  }, last);
  return { refId: `${prefix}${String(highest + 1).padStart(3, "0")}`, sequence: highest + 1, prefix };
}
function nextProjectReference(client, projects, last = 0) {
  const prefix = `${client.refId}-`;
  const highest = projects.filter((p) => p.clientId === client.id).reduce((max, p) => {
    const suffix = p.refId.startsWith(prefix) ? p.refId.slice(prefix.length) : "";
    return /^\d+$/.test(suffix) ? Math.max(max, Number(suffix)) : max;
  }, last);
  return { refId: `${prefix}${highest + 1}`, sequence: highest + 1 };
}
function normalizeReferences(clients, projects) {
  const normalizedClients = [...clients];
  for (let i = 0; i < normalizedClients.length; i++) if (!/^MFx-\d{5,}$/.test(normalizedClients[i].refId)) normalizedClients[i] = { ...normalizedClients[i], refId: nextClientReference(normalizedClients).refId };
  const normalizedProjects = [...projects];
  for (let i = 0; i < normalizedProjects.length; i++) {
    const client = normalizedClients.find((c) => c.id === normalizedProjects[i].clientId);
    if (client) {
      const prefix = client.refId + "-";
      const suffix = normalizedProjects[i].refId.slice(prefix.length);
      if (!normalizedProjects[i].refId.startsWith(prefix) || !/^\d+$/.test(suffix)) normalizedProjects[i] = { ...normalizedProjects[i], refId: nextProjectReference(client, normalizedProjects).refId };
    }
  }
  return { clients: normalizedClients, projects: normalizedProjects };
}
function referenceHighWater(clients, projects, previous = {}) {
  const counters = { ...previous };
  for (const client of clients) {
    const match = /^MFx-(\d{2})(\d{3,})$/.exec(client.refId);
    if (match) {
      const key2 = "MFx-" + match[1];
      counters[key2] = Math.max(counters[key2] || 0, Number(match[2]));
    }
    const key = "project:" + client.id;
    counters[key] = nextProjectReference(client, projects, counters[key] || 0).sequence - 1;
  }
  return counters;
}

// src/utils/deduplicate.ts
function uniqueRecords(records) {
  const seen = /* @__PURE__ */ new Set();
  return records.filter((record) => {
    const key = JSON.stringify(record);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// src/store/useStore.ts
var useStore = create()(
  persist(
    (set, get) => ({
      referenceCounters: {},
      createClient: (data) => {
        const state = get();
        const prefix = "MFx-" + String((/* @__PURE__ */ new Date()).getFullYear()).slice(-2);
        const next = nextClientReference(state.clients, state.referenceCounters[prefix] || 0);
        const client = { ...data, id: crypto.randomUUID(), refId: next.refId };
        set({ clients: [...state.clients, client], referenceCounters: { ...state.referenceCounters, [prefix]: next.sequence } });
        return client;
      },
      createProject: (data) => {
        const state = get();
        const client = state.clients.find((c) => c.id === data.clientId);
        if (!client) throw new Error("Select a valid client.");
        const key = "project:" + client.id;
        const next = nextProjectReference(client, state.projects, state.referenceCounters[key] || 0);
        const project = { ...data, id: crypto.randomUUID(), refId: next.refId };
        set({ projects: [...state.projects, project], referenceCounters: { ...state.referenceCounters, [key]: next.sequence } });
        return project;
      },
      // Theme
      isDarkMode: false,
      toggleTheme: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }));
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark");
        }
      },
      // Clients
      clients: [],
      addClient: (client) => set((state) => ({
        clients: state.clients.some((c) => c.id === client.id || c.refId === client.refId) ? state.clients : [...state.clients, client]
      })),
      updateClient: (id, data) => set((state) => ({
        clients: state.clients.map(
          (c) => c.id === id ? { ...c, ...data } : c
        )
      })),
      deleteClient: (id) => set((state) => ({
        referenceCounters: referenceHighWater(state.clients, state.projects, state.referenceCounters),
        clients: state.clients.filter((c) => c.id !== id),
        projects: state.projects.filter((p) => p.clientId !== id),
        timeEntries: state.timeEntries.filter((e) => !state.projects.some((p) => p.clientId === id && p.id === e.projectId)),
        activeTimeEntry: state.projects.some((p) => p.clientId === id && p.id === state.activeTimeEntry?.projectId) ? null : state.activeTimeEntry
      })),
      getClientById: (id) => get().clients.find((c) => c.id === id),
      // Projects
      projects: [],
      addProject: (project) => set((state) => ({
        projects: state.projects.some((p) => p.id === project.id || p.refId === project.refId) ? state.projects : [...state.projects, project]
      })),
      updateProject: (id, data) => set((state) => {
        const counters = referenceHighWater(state.clients, state.projects, state.referenceCounters);
        const old = state.projects.find((p) => p.id === id);
        const client = state.clients.find((c) => c.id === data.clientId);
        if (old && data.clientId && data.clientId !== old.clientId && !client) throw new Error("Select a valid client.");
        let updated = { ...data };
        if (old && client && client.id !== old.clientId) {
          const key = "project:" + client.id;
          const next = nextProjectReference(client, state.projects, counters[key] || 0);
          updated = { ...data, refId: next.refId };
          counters[key] = next.sequence;
        }
        return { referenceCounters: counters, projects: state.projects.map((p) => p.id === id ? { ...p, ...updated } : p) };
      }),
      deleteProject: (id) => set((state) => ({
        referenceCounters: referenceHighWater(state.clients, state.projects, state.referenceCounters),
        projects: state.projects.filter((p) => p.id !== id),
        timeEntries: state.timeEntries.filter((e) => e.projectId !== id),
        activeTimeEntry: state.activeTimeEntry?.projectId === id ? null : state.activeTimeEntry
      })),
      getProjectById: (id) => get().projects.find((p) => p.id === id),
      // Time Tracking
      timeEntries: [],
      activeTimeEntry: null,
      startTimer: (projectId, description) => {
        if (!get().projects.some((p) => p.id === projectId)) return;
        if (get().activeTimeEntry) get().stopTimer();
        const entry = {
          id: crypto.randomUUID(),
          projectId,
          startTime: (/* @__PURE__ */ new Date()).toISOString(),
          description,
          isActive: true
        };
        set((state) => ({
          activeTimeEntry: entry,
          timeEntries: [...state.timeEntries, entry]
        }));
      },
      stopTimer: () => {
        const active = get().activeTimeEntry;
        if (!active) return;
        const endTime = (/* @__PURE__ */ new Date()).toISOString();
        const duration = new Date(endTime).getTime() - new Date(active.startTime).getTime();
        set((state) => ({
          activeTimeEntry: null,
          timeEntries: state.timeEntries.map(
            (entry) => entry.id === active.id ? { ...entry, endTime, duration, isActive: false } : entry
          )
        }));
      },
      // Services Catalog
      servicesCatalog: standardServices,
      updateServiceInCatalog: (id, data) => set((state) => ({ servicesCatalog: state.servicesCatalog.map((s) => s.id === id ? { ...s, ...data } : s) })),
      addServiceToCatalog: (service) => set((state) => ({
        servicesCatalog: [...state.servicesCatalog, service]
      }))
    }),
    {
      name: "mfx-storage",
      version: 2,
      migrate: (persisted) => {
        const previous = persisted;
        try {
          localStorage.setItem("mfx-storage-before-v2", JSON.stringify(previous));
          return { ...previous, ...normalizeReferences(uniqueRecords(previous.clients || []), uniqueRecords(previous.projects || [])), servicesCatalog: refreshCatalog(previous.servicesCatalog || []), referenceCounters: previous.referenceCounters || {}, timeEntries: uniqueRecords(previous.timeEntries || []) };
        } catch {
          return previous;
        }
      },
      partialize: (state) => ({
        referenceCounters: state.referenceCounters,
        isDarkMode: state.isDarkMode,
        clients: state.clients,
        projects: state.projects,
        timeEntries: state.timeEntries,
        activeTimeEntry: state.activeTimeEntry,
        servicesCatalog: state.servicesCatalog
      })
    }
  )
);
if (typeof document !== "undefined") {
  const stored = localStorage.getItem("mfx-storage");
  try {
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state.isDarkMode) {
        document.documentElement.classList.add("dark");
      }
    }
  } catch {
  }
}
export {
  useStore
};
