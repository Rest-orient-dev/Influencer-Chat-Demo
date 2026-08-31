import { AcademyProgress } from "@/academy/types";
import priced from "../../data/priced-influencers.json";
import {
  AppUser,
  ChatMessage,
  ChatSession,
  EvaluationResult,
  Influencer,
} from "@/lib/types";
import { normalizeInfluencers, RawInfluencer } from "@/lib/normalize-influencer";
import fs from "node:fs";
import path from "node:path";

type Store = {
  users: AppUser[];
  passwords: Record<string, string>;
  influencers: Influencer[];
  sessions: ChatSession[];
  messages: ChatMessage[];
  evaluations: EvaluationResult[];
  academyProgress: Record<string, AcademyProgress>;
};

const STORE_VERSION = 5;
const STORE_FILE = path.join(process.cwd(), ".data", "local-store.json");

const seededUsers: AppUser[] = [
  { id: "u1", name: "Ana García", email: "ana@orient.local", role: "agent" },
  { id: "u2", name: "Carlos Ruiz", email: "carlos@orient.local", role: "agent" },
  { id: "u3", name: "Manager", email: "admin@orient.local", role: "admin" },
];

const seededInfluencers = normalizeInfluencers(priced as RawInfluencer[]);

const defaultPasswords: Record<string, string> = {
  u1: "123456",
  u2: "123456",
  u3: "123456",
};

function readPersisted(): Partial<Store> | null {
  try {
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    return JSON.parse(raw) as Partial<Store>;
  } catch {
    return null;
  }
}

function mergeSeedUsers(users: AppUser[], passwords: Record<string, string>) {
  const emails = new Set(users.map((u) => u.email.toLowerCase()));
  for (const seed of seededUsers) {
    if (emails.has(seed.email.toLowerCase())) continue;
    users.push(seed);
    if (!passwords[seed.id]) passwords[seed.id] = defaultPasswords[seed.id];
  }
}

function createStore(): Store {
  const saved = readPersisted();
  const users = saved?.users?.length ? [...saved.users] : [...seededUsers];
  const passwords = { ...defaultPasswords, ...(saved?.passwords ?? {}) };
  mergeSeedUsers(users, passwords);
  return {
    users,
    passwords,
    influencers: seededInfluencers,
    sessions: saved?.sessions ?? [],
    messages: saved?.messages ?? [],
    evaluations: saved?.evaluations ?? [],
    academyProgress: saved?.academyProgress ?? {},
  };
}

const globalRef = globalThis as unknown as {
  __trainingStore?: Store;
  __trainingStoreVersion?: number;
};

if (!globalRef.__trainingStore || globalRef.__trainingStoreVersion !== STORE_VERSION) {
  globalRef.__trainingStore = createStore();
  globalRef.__trainingStoreVersion = STORE_VERSION;
}

if (!globalRef.__trainingStore.passwords) {
  globalRef.__trainingStore.passwords = { ...defaultPasswords };
}
if (!globalRef.__trainingStore.academyProgress) {
  globalRef.__trainingStore.academyProgress = {};
}

export const store = globalRef.__trainingStore;

export function persistStore() {
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(
      STORE_FILE,
      JSON.stringify(
        {
          users: store.users,
          passwords: store.passwords,
          sessions: store.sessions,
          messages: store.messages,
          evaluations: store.evaluations,
          academyProgress: store.academyProgress,
        },
        null,
        2,
      ),
      "utf8",
    );
  } catch (err) {
    console.error("No se pudo guardar el almacén local", err);
  }
}

export const uid = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
