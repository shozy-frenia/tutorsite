"use client";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { firebaseAuth, firebaseDb, firebaseEnabled } from "./client";
import { mergeStores, readStore, replaceStore, type Store } from "@/lib/storage";

/**
 * Cloud sync for the local store.
 *
 * localStorage stays the source the UI reads from — it is synchronous, it works
 * offline, and it is what every existing screen already talks to. Firestore is
 * a mirror of that one document, so signing in on a second device brings the
 * history across and signing out leaves the device's own copy intact.
 *
 * Merging is union-by-id rather than last-write-wins, because two devices
 * writing different attempts is the normal case, not a conflict: a student
 * sits a paper on a phone and another on a laptop, and both belong in the
 * history. Only the profile is genuinely single-valued, so that one is decided
 * by `updatedAt`.
 */

export type AuthState =
  | { status: "disabled" }
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; user: { uid: string; name: string | null; email: string | null } };

const docPath = (uid: string) => doc(firebaseDb()!, "students", uid);

/** Watch sign-in state. Returns an unsubscribe, or a no-op when unconfigured. */
export function watchAuth(onChange: (state: AuthState) => void): () => void {
  const auth = firebaseAuth();
  if (!firebaseEnabled || !auth) {
    onChange({ status: "disabled" });
    return () => {};
  }
  onChange({ status: "loading" });
  return onAuthStateChanged(auth, (user: User | null) => {
    onChange(
      user
        ? {
            status: "signed-in",
            user: { uid: user.uid, name: user.displayName, email: user.email },
          }
        : { status: "signed-out" }
    );
  });
}

export async function signInWithGoogle(): Promise<void> {
  const auth = firebaseAuth();
  if (!auth) throw new Error("Firebase is not configured.");
  await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function signOutOfTalap(): Promise<void> {
  const auth = firebaseAuth();
  if (auth) await signOut(auth);
}

/**
 * Mirror one student's document both ways for as long as they are signed in.
 *
 * The snapshot listener merges anything the other device wrote into the local
 * store; `push` sends the merged result back. Writes are skipped while a
 * snapshot is being applied, so the two sides cannot ping-pong.
 */
export function syncStore(uid: string): () => void {
  const db = firebaseDb();
  if (!db) return () => {};

  let applying = false;

  const push = async (store: Store) => {
    if (applying) return;
    try {
      await setDoc(docPath(uid), store, { merge: false });
    } catch {
      // Offline or rules-denied: the local store is still correct, and the
      // next snapshot or the next write will reconcile it.
    }
  };

  const stop = onSnapshot(
    docPath(uid),
    (snap) => {
      const remote = snap.data() as Store | undefined;
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
