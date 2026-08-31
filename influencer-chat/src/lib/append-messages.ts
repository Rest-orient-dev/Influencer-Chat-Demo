import { ChatMessage } from "@/lib/types";
import { persistStore, store, uid } from "@/lib/store";

export function appendStoreMessages(
  sessionId: string,
  role: "user" | "assistant",
  texts: string[],
): ChatMessage[] {
  const created: ChatMessage[] = texts
    .map((content) => content.trim())
    .filter(Boolean)
    .map((content, index) => ({
      id: uid("msg"),
      sessionId,
      role,
      content,
      createdAt: new Date(Date.now() + index).toISOString(),
    }));
  store.messages.push(...created);
  const session = store.sessions.find((s) => s.id === sessionId);
  if (session) session.updatedAt = new Date().toISOString();
  persistStore();
  return created;
}
