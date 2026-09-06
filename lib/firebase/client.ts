"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";

/**
 * Firebase, initialised only when it is actually configured.
 *
 * The app has always run end to end with no keys at all — that is what makes
 * it demoable on any machine — and adding accounts must not take that away.
 * Every entry point here returns null when the environment is missing, and the
 * callers fall back to the localStorage store they already used.
 *
 * The NEXT_PUBLIC_* values are not secrets: Firebase web config is public by
 * design and ships inside every client bundle that has ever used Firebase.
 * What keeps one student's attempts out of another's hands is
 * `database.rules.json`, not the obscurity of the project id.
 *
 * WHY REALTIME DATABASE AND NOT FIRESTORE
 * This module used to talk to Firestore. The project that actually exists is
 * a Realtime Database instance in europe-west1, so the sync layer follows the
 * database that is provisioned rather than the one the first draft assumed.
 * The two products do not share an API, a wire format, or a rules language,
 * so this is a real switch and not a rename.
 */

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * True when the browser bundle carries enough config to sign someone in.
 *
 * `databaseURL` is deliberately not part of this test: sign-in and
 * registration work without it, and only cross-device sync does not. A
 * missing database URL should cost the student their history following them
 * to a second device, not their ability to have an account at all.
 */
export const firebaseEnabled = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId
);

/** True when progress can additionally be mirrored to the cloud. */
export const firebaseSyncEnabled = Boolean(firebaseEnabled && config.databaseURL);

let app: FirebaseApp | null = null;

function firebaseApp(): FirebaseApp | null {
  if (!firebaseEnabled || typeof window === "undefined") return null;
  if (!app) app = getApps()[0] ?? initializeApp(config as Required<typeof config>);
  return app;
}

export function firebaseAuth(): Auth | null {
  const instance = firebaseApp();
  return instance ? getAuth(instance) : null;
}

export function firebaseRtdb(): Database | null {
  if (!firebaseSyncEnabled) return null;
  const instance = firebaseApp();
  return instance ? getDatabase(instance) : null;
}
