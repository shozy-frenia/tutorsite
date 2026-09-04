"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebase, initialised only when it is actually configured.
 *
 * The app has always run end to end with no keys at all — that is what makes
 * it demoable on any machine — and adding an account must not take that away.
 * Every entry point here returns null when the environment is missing, and the
 * callers fall back to the localStorage store they already used.
 *
 * The NEXT_PUBLIC_* values are not secrets: Firebase web config is public by
 * design, and access is decided by the Firestore security rules in
 * `firestore.rules`, not by hiding the project id.
 */

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True when the browser bundle carries a complete Firebase config. */
export const firebaseEnabled = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId
);

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

export function firebaseDb(): Firestore | null {
  const instance = firebaseApp();
  return instance ? getFirestore(instance) : null;
}
