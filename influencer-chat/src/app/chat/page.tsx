"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BootstrapResponse, ChatMessage, ChatSession, EvaluationResult } from "@/lib/types";
import { avatarColor, formatDateLabel, formatTime, initials } from "@/lib/format";
import { useAuthUser } from "@/lib/use-auth";
import { EvaluationReportCard } from "@/app/_components/EvaluationReportCard";
import { matchQuickReplies, slashQuery, type QuickReply } from "@/lib/quick-replies";
import { SlashPicker } from "./SlashPicker";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function typingDelayMs(text: string) {
  return Math.min(5200, Math.max(1400, 900 + text.length * 26));
}

export default function ChatPage() {
  const router = useRouter();
  const { user, ready } = useAuthUser();
  const [data, setData] = useState<BootstrapResponse | null>(null);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [optimisticUser, setOptimisticUser] = useState<ChatMessage | null>(null);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [evalOpen, setEvalOpen] = useState(false);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [slashIndex, setSlashIndex] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const openingRef = useRef(new Set<string>());

  const loadData = async () => {
    const res = await fetch("/api/bootstrap");
    if (res.status === 401) {
      router.replace("/login");
      return;
    }
    const json = (await res.json()) as BootstrapResponse;
    setData(json);
    setActiveSessionId((prev) => prev || json.sessions[0]?.id || "");
  };

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user]);

  const visibleSessions = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return [...data.sessions]
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
      .filter((s) => {
        const inf = data.influencers.find((i) => i.id === s.influencerId);
        if (!q) return true;
        return (
          (inf?.name ?? s.title).toLowerCase().includes(q) ||
          (inf?.handle ?? "").toLowerCase().includes(q)
        );
      });
  }, [data, search]);

  const activeSession = visibleSessions.find((s) => s.id === activeSessionId) ??
    data?.sessions.find((s) => s.id === activeSessionId);
  const activeInfluencer = data?.influencers.find(
    (i) => i.id === activeSession?.influencerId,
  );
  const activeMessages = (data?.messages || []).filter(
    (m) => m.sessionId === activeSessionId,
  );
  const activeEvaluation =
    data?.evaluations.find((e) => e.sessionId === activeSessionId) ?? evalResult;
  const shownMessages = useMemo(() => {
    const list = [...activeMessages];
    if (
      optimisticUser &&
      optimisticUser.sessionId === activeSessionId &&
      !list.some((m) => m.id === optimisticUser.id)
    ) {
      list.push(optimisticUser);
    }
    if (typing && !optimisticUser) {
      return list.filter((m) => m.role === "user");
    }
    return list;
  }, [activeMessages, optimisticUser, activeSessionId, typing]);

  const slash = slashQuery(message);
  const slashItems = useMemo(
    () => (slash ? matchQuickReplies(slash.query) : []),
    [slash],
  );

  useEffect(() => {
    setSlashIndex(0);
  }, [slash?.query]);

  const applySlash = (item: QuickReply) => {
    if (!slash) return;
    setMessage(`${message.slice(0, slash.start)}${item.body}`);
    setSlashIndex(0);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [shownMessages.length, activeSessionId, typing]);

  const lastMessageOf = (session: ChatSession): ChatMessage | undefined => {
    const list = (data?.messages || []).filter((m) => m.sessionId === session.id);
    return list[list.length - 1];
  };

  const sendMessage = async () => {
    if (!activeSessionId || !message.trim() || loading || typing) return;
    if (slash && slashItems.length) return;
    const text = message.trim();
    setMessage("");
    const optimistic: ChatMessage = {
      id: `tmp_${Date.now()}`,
      sessionId: activeSessionId,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setOptimisticUser(optimistic);
    setTyping(true);
    setLoading(true);
    const started = Date.now();
    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSessionId, content: text }),
      });
      const json = await res.json();
      const botText = Array.isArray(json.botMsgs)
        ? json.botMsgs.map((m: ChatMessage) => m.content).join(" ")
        : json.botMsg?.content || "";
      const remain = typingDelayMs(botText) - (Date.now() - started);
      if (remain > 0) await sleep(remain);
      await loadData();
    } finally {
      setOptimisticUser(null);
      setTyping(false);
      setLoading(false);
    }
  };

  const startChat = async (influencerId: string) => {
    if (user?.role !== "admin") return;
    setNewChatOpen(false);
    setTyping(true);
    setLoading(true);
    const started = Date.now();
    try {
      const res = await fetch("/api/sessions/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ influencerId }),
      });
      const json = await res.json();
      if (json.session?.id) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                sessions: [
                  json.session,
                  ...prev.sessions.filter((s) => s.id !== json.session.id),
                ],
              }
            : prev,
        );
        setActiveSessionId(json.session.id);
      }
      const remain = 2000 - (Date.now() - started);
      if (remain > 0) await sleep(remain);
      await loadData();
    } finally {
      setTyping(false);
      setLoading(false);
    }
  };

  const openAssignedSession = async (sessionId: string) => {
    if (openingRef.current.has(sessionId)) return;
    openingRef.current.add(sessionId);
    setTyping(true);
    setLoading(true);
    const started = Date.now();
    try {
      await fetch("/api/sessions/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const remain = 1800 - (Date.now() - started);
      if (remain > 0) await sleep(remain);
      await loadData();
    } catch {
      openingRef.current.delete(sessionId);
    } finally {
      setTyping(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeSessionId || !data || typing) return;
    const msgs = data.messages.filter((m) => m.sessionId === activeSessionId);
    if (msgs.length > 0) return;
    const session = data.sessions.find((s) => s.id === activeSessionId);
    if (!session || session.status === "completed") return;
    void openAssignedSession(activeSessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSessionId, data, typing]);

  const runEvaluation = async () => {
    if (!activeSessionId) return;
    setLoading(true);
    const res = await fetch("/api/evaluations/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: activeSessionId }),
    });
    const json = await res.json();
    if (!res.ok || !json.evaluation) {
      setEvalResult(null);
      setEvalOpen(false);
      setLoading(false);
      return;
    }
    setEvalResult(json.evaluation);
    setEvalOpen(true);
    await loadData();
    setLoading(false);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (!ready || !user) {
    return <div className="grid min-h-screen place-items-center bg-[#111b21] text-white">Cargando…</div>;
  }

  return (
    <div className="h-screen overflow-hidden bg-[#0b141a]">
      <div className="absolute inset-x-0 top-0 h-[127px] bg-[#00a884]" />
      <div className="relative mx-auto flex h-full max-w-[1600px] py-5">
        <div className="mx-5 flex min-h-0 flex-1 overflow-hidden bg-white shadow-[0_1px_3px_rgba(11,20,26,0.4)]">
          <aside className="flex w-[30%] min-w-[340px] max-w-[420px] flex-col border-r border-[#e9edef]">
            <header className="flex h-[59px] items-center justify-between bg-[#f0f2f5] px-4">
              <div className="flex items-center gap-3">
                <Avatar name={user.name} seed={user.sub} />
                <div>
                  <div className="text-sm font-medium text-[#111b21]">{user.name}</div>
                  <div className="text-xs text-[#667781]">
                    {user.role === "admin" ? "Administrador" : "Estudiante"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#54656f]">
                <IconButton title="Academia" onClick={() => router.push("/academy")}>
                  <CapIcon />
                </IconButton>
                {user.role === "admin" && (
                  <IconButton title="Panel" onClick={() => router.push("/admin")}>
                    <GridIcon />
                  </IconButton>
                )}
                {user.role === "admin" && (
                  <IconButton title="Nuevo chat" onClick={() => setNewChatOpen(true)}>
                    <ChatPlusIcon />
                  </IconButton>
                )}
                <IconButton title="Salir" onClick={logout}>
                  <MenuIcon />
                </IconButton>
              </div>
            </header>

            <div className="bg-[#f0f2f5] px-3 pb-2">
              <div className="flex h-[35px] items-center rounded-lg bg-white px-3">
                <SearchIcon />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar chat"
                  className="ml-3 w-full bg-transparent text-sm text-[#111b21] outline-none placeholder:text-[#667781]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {visibleSessions.map((session) => {
                const inf = data?.influencers.find((i) => i.id === session.influencerId);
                const last = lastMessageOf(session);
                const active = session.id === activeSessionId;
                return (
                  <button
                    key={session.id}
                    onClick={() => setActiveSessionId(session.id)}
                    className={`flex w-full cursor-pointer items-center gap-3 border-b border-[#e9edef] px-3 py-[10px] text-left ${
                      active ? "bg-[#f0f2f5]" : "bg-white hover:bg-[#f5f6f6]"
                    }`}
                  >
                    <Avatar name={inf?.name ?? session.title} seed={session.influencerId} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between">
                        <div className="truncate text-[16px] text-[#111b21]">
                          {inf?.name ?? session.title}
                        </div>
                        <div className="ml-2 shrink-0 text-[12px] text-[#667781]">
                          {last ? formatDateLabel(last.createdAt) : ""}
                        </div>
                      </div>
                      <div className="mt-[2px] flex items-center justify-between gap-2">
                        <div className="truncate text-[13px] text-[#667781]">
                          {last?.role === "user" ? "Tú: " : ""}
                          {last?.content ?? "Asignado"}
                        </div>
                        {session.status === "completed" && (
                          <span className="shrink-0 rounded-full bg-[#d9fdd3] px-1.5 text-[10px] text-[#008069]">
                            listo
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col">
            {activeSession && activeInfluencer ? (
              <>
                <header className="flex h-[59px] items-center justify-between bg-[#f0f2f5] px-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={activeInfluencer.name} seed={activeInfluencer.id} />
                    <div>
                      <div className="text-[16px] text-[#111b21]">{activeInfluencer.name}</div>
                      <div className="text-[13px] text-[#667781]">
                        {typing ? (
                          <span className="italic text-[#00a884]">escribiendo…</span>
                        ) : (
                          `${activeInfluencer.handle} · en línea`
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.role === "admin" && (
                      <button
                        onClick={() => startChat(activeInfluencer.id)}
                        className="cursor-pointer rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#008069] hover:bg-[#e9edef]"
                      >
                        Nueva ronda
                      </button>
                    )}
                    {activeSession.status === "completed" ? (
                      <button
                        onClick={() => {
                          if (activeEvaluation) {
                            setEvalResult(activeEvaluation);
                            setEvalOpen(true);
                          }
                        }}
                        disabled={!activeEvaluation}
                        className="cursor-pointer rounded-full bg-[#008069] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#017561] disabled:opacity-60"
                      >
                        Ver informe
                      </button>
                    ) : (
                      <button
                        onClick={runEvaluation}
                        disabled={loading}
                        className="cursor-pointer rounded-full bg-[#008069] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#017561] disabled:opacity-60"
                      >
                        {loading ? "Evaluando…" : "Cerrar y evaluar"}
                      </button>
                    )}
                  </div>
                </header>

                <div className="wa-wallpaper relative flex-1 overflow-y-auto px-16 py-4 scrollbar-thin">
                  {shownMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`mb-1 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`relative max-w-[65%] px-[9px] pb-[8px] pt-[6px] text-[14.2px] leading-[19px] text-[#111b21] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] ${
                          m.role === "user" ? "wa-bubble-out" : "wa-bubble-in"
                        }`}
                      >
                        <MessageBody text={m.content} />
                        <span className="ml-2 inline-block translate-y-[4px] float-right text-[11px] text-[#667781]">
                          {formatTime(m.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {typing && (
                    <div className="mb-1 flex justify-start">
                      <div className="wa-bubble-in px-3 py-2 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]">
                        <div className="wa-typing" aria-label="Escribiendo">
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                <form
                  className="relative flex items-center gap-2 bg-[#f0f2f5] px-4 py-2.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                >
                  <span className="text-[#54656f]">
                    <SmileIcon />
                  </span>
                  <span className="text-[#54656f]">
                    <ClipIcon />
                  </span>
                  <div className="relative min-w-0 flex-1">
                    {slash && (
                      <SlashPicker
                        items={slashItems}
                        active={slashIndex}
                        onHover={setSlashIndex}
                        onPick={applySlash}
                      />
                    )}
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (!slash) return;
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setSlashIndex((i) =>
                            slashItems.length ? (i + 1) % slashItems.length : 0,
                          );
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          setSlashIndex((i) =>
                            slashItems.length
                              ? (i - 1 + slashItems.length) % slashItems.length
                              : 0,
                          );
                        } else if (e.key === "Enter" && slashItems[slashIndex]) {
                          e.preventDefault();
                          applySlash(slashItems[slashIndex]);
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          setMessage(message.slice(0, slash.start));
                        }
                      }}
                      placeholder="Escribe un mensaje o / para atajos"
                      className="h-[42px] w-full rounded-lg bg-white px-4 text-[15px] text-[#111b21] outline-none placeholder:text-[#667781]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || typing || !message.trim()}
                    className="cursor-pointer text-[#54656f] disabled:opacity-40"
                    aria-label="Enviar"
                  >
                    <SendIcon />
                  </button>
                </form>
              </>
            ) : (
              <EmptyState
                canCreate={user.role === "admin"}
                onNew={() => setNewChatOpen(true)}
              />
            )}
          </section>
        </div>
      </div>

      {newChatOpen && (
        <Modal title="Nuevo chat" onClose={() => setNewChatOpen(false)}>
          <p className="mb-3 text-sm text-[#667781]">Elige un influencer para empezar a negociar.</p>
          <div className="max-h-[360px] space-y-1 overflow-y-auto">
            {(data?.influencers ?? []).map((inf) => (
              <button
                key={inf.id}
                onClick={() => startChat(inf.id)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-[#f0f2f5]"
              >
                <Avatar name={inf.name} seed={inf.id} />
                <div>
                  <div className="text-sm text-[#111b21]">{inf.name}</div>
                  <div className="text-xs text-[#667781]">{inf.handle}</div>
                </div>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {evalOpen && evalResult && (
        <Modal title="Informe de tu negociación" onClose={() => setEvalOpen(false)} wide>
          <EvaluationReportCard evaluation={evalResult} />
        </Modal>
      )}
    </div>
  );
}

function MessageBody({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, i) =>
        /^https?:\/\//i.test(part) ? (
          <a
            key={`${part}-${i}`}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="text-[#027eb5] underline"
          >
            {part}
          </a>
        ) : (
          <span key={`${i}-${part.slice(0, 12)}`}>{part}</span>
        ),
      )}
    </span>
  );
}

function Avatar({ name, seed }: { name: string; seed: string }) {
  return (
    <div
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
      style={{ background: avatarColor(seed) }}
    >
      {initials(name)}
    </div>
  );
}

function IconButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="grid h-10 w-10 cursor-pointer place-items-center rounded-full hover:bg-[#dfe5e7]"
    >
      {children}
    </button>
  );
}

function Modal({
  title,
  children,
  onClose,
  wide,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div
        className={`w-full rounded-lg bg-white p-5 text-[#111b21] shadow-xl ${
          wide ? "max-h-[88vh] max-w-2xl overflow-y-auto" : "max-w-md"
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg">{title}</h3>
          <button onClick={onClose} className="cursor-pointer text-[#667781]">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function EmptyState({
  onNew,
  canCreate,
}: {
  onNew: () => void;
  canCreate: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[#f0f2f5] text-center">
      <div className="mb-4 text-[#00a884]">
        <svg viewBox="0 0 24 24" className="mx-auto h-16 w-16" fill="currentColor">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2z" />
        </svg>
      </div>
      <h2 className="text-3xl font-light text-[#41525d]">Orient WhatsApp</h2>
      <p className="mt-2 max-w-sm text-sm text-[#667781]">
        {canCreate
          ? "Selecciona un chat o empieza una nueva negociación con un influencer."
          : "Primero estudia el método en la Academia. Luego espera a que un administrador te asigne conversaciones."}
      </p>
      <div className="mt-6 flex flex-col items-center gap-2">
        <a
          href="/academy"
          className="cursor-pointer rounded-full bg-[#00a884] px-5 py-2 text-sm font-medium text-white"
        >
          Abrir Academia
        </a>
        {canCreate && (
          <button
            onClick={onNew}
            className="cursor-pointer rounded-full bg-white px-5 py-2 text-sm font-medium text-[#008069]"
          >
            Nuevo chat
          </button>
        )}
      </div>
    </div>
  );
}

function CapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3.2 1.8 8.4 12 13.6 20.4 9.3v5.4h1.8V8.4L12 3.2z" />
      <path d="M6.3 12.4v3.2c0 1.6 2.5 3.2 5.7 3.2s5.7-1.6 5.7-3.2v-3.2L12 15.2 6.3 12.4z" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#54656f]">
      <path
        d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
function ChatPlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="6" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="18" r="1.6" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
    </svg>
  );
}
function SmileIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-3.2 8.2a1.2 1.2 0 110-2.4 1.2 1.2 0 010 2.4zm6.4 0a1.2 1.2 0 110-2.4 1.2 1.2 0 010 2.4zM12 17.2c-2.3 0-4.2-1.4-5-3.4h1.7c.7 1.2 2 2 3.3 2s2.6-.8 3.3-2H17c-.8 2-2.7 3.4-5 3.4z" />
    </svg>
  );
}
function ClipIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 6.5v9.2a4.5 4.5 0 11-9 0V6.7a3.2 3.2 0 016.4 0v8.6a1.9 1.9 0 11-3.8 0V7.4h1.5v7.9a.4.4 0 10.8 0V6.7a1.7 1.7 0 10-3.4 0v9a3 3 0 106 0V6.5h1.5z" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
    </svg>
  );
}
