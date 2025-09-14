import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);


const PROTECTED_PATHS = ["/addTransaction", "/dashboard"];


if (typeof window !== "undefined") {
  onAuthStateChanged(auth, (user) => {
    const path = window.location.pathname;
    if (!user && PROTECTED_PATHS.some(p => path.startsWith(p))) {
      window.location.replace("/");
    }
  });
}

export function requireAuth(redirectTo = "/") {
  if (typeof window === "undefined") return;
  if (!auth.currentUser) {
    window.location.replace(redirectTo);
  }
}

export function signOutUser() {
  return signOut(auth);
}
