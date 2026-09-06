"use client";

import { onValue, ref, set } from "firebase/database";
import { firebaseRtdb } from "./client";
import { mergeStores, readStore, replaceStore, type Store } from "@/lib/storage";

/**
 * Cloud sync for the local store, over the Realtime Database.
 *
 * localStorage stays the source the UI reads from — it is synchronous, it
 * works offline, and it is what every existing screen already talks to. The
 * database is a mirror of that one document, so signing in on a second device
 * brings the history across and signing out leaves the device's own copy
 * intact.
 *
 * Merging is union-by-id rather than last-write-wins, because two devices
 * writing different attempts is the normal case, not a conflict: a student
 * sits a paper on a phone and another on a laptop, and both belong in the
 * history. Only the profile is genuinely single-valued, so that one is decided
 * by `updatedAt`.
 */

const path = (uid: string) => `students/${uid}`;

/**
 * Make a Store safe to hand to the Realtime Database.
 *
 * RTDB throws on `undefined` anywhere in the payload rather than dropping the
 * key the way Firestore's merge does, and `Store.updatedAt` is optional — so
 * a store written before sync existed would fail every write with a runtime
 * error and no obvious cause. Stripping undefined recursively is the whole
 * fix, and it has to be recursive because attempts carry nested outcomes.
 */
function sanitize<T>(value: T): T {
  if (Array.isArray(value)) return value.map(sanitize) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) out[k] = sanitize(v);
    }
    return out as T;
  }
  return value;
}

/**
 * Put a snapshot back into Store shape.
 *
 * The database drops empty arrays and null fields entirely rather than
 * storing them, so a student with no attempts yet reads back as `{}` and not
 * as `{attempts: []}`. Without this the first merge after a fresh sign-in
 * would throw on `remote.attempts.length`.
 */
function normalize(raw: unknown): Store | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Partial<Store>;
  return {
    profile: value.profile ?? null,
    attempts: Array.isArray(value.attempts) ? value.attempts.filter(Boolean) : [],
    activeDays: Array.isArray(value.activeDays) ? value.activeDays.filter(Boolean) : [],
    updatedAt: value.updatedAt,
  };
}

/**
 * Mirror one student's record both ways for as long as they are signed in.
 *
 * The value listener merges anything another device wrote into the local
 * store; `push` sends the merged result back. Writes are skipped while a
 * snapshot is being applied, so the two sides cannot ping-pong.
 */
export function syncStore(uid: string): () => void {
  const db = firebaseRtdb();
  if (!db) return () => {};

  const node = ref(db, path(uid));
  let applying = false;

  const push = async (store: Store) => {
    if (applying) return;
    try {
      await set(node, sanitize(store));
    } catch {
      // Offline or rules-denied: the local store is still correct, and the
      // next snapshot or the next write will reconcile it.
    }
  };

  const stop = onValue(
    node,
    (snapshot) => {
      const remote = normalize(snapshot.val());
      const local = readStore();
      const merged = remote ? mergeStores(local, remote) : local;
      applying = true;
      replaceStore(merged);
      applying = false;
      if (!remote || JSON.stringify(remote) !== JSON.stringify(merged)) void push(merged);
    },
    () => {
      /* permission or network error — stay local */
    }
  );

  const onLocalWrite = () => void push(readStore());
  window.addEventListener("talap:store", onLocalWrite);

  return () => {
    stop();
    window.removeEventListener("talap:store", onLocalWrite);
  };
}
