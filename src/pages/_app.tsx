import { useState, useEffect } from 'react';
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Poppins } from "next/font/google"; // Corrected import path
import * as ROUTES from "../constants/routes";
import UserContext from '../context/user';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/router';
import Layout from '../common/components/Layout/Layout';
import { SocketProvider } from '../context/SocketContext';
import { Toaster } from 'sonner';
// import { AuthProvider,useAuth } from '../context/AuthContext';
// -------------------------------------
// FIX APPLIED HERE:
// 1. Added the required 'subsets' property.
// 2. Changed 'weight' to be an array of strings (["500"]).
// -------------------------------------
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500"],
});

export default function App({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Define routes that DON'T need the main layout.
  // Note: /questions/[id] is dynamic, but Next.js router.pathname will show the template string
  const noLayoutRoutes = ['/', '/login', '/signup', '/questions/[id]', '/CompleteProfile'];

  // Define routes that are PUBLIC and don't require a user to be logged in.
  const publicRoutes = ['/', '/login', '/signup', '/questions/[id]'];

  // Check if current route is in the list for showing the layout
  const showLayout = !noLayoutRoutes.includes(router.pathname);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function. We'll use it for cleanup.
    const unsubscribe = onAuthStateChanged(auth, (authUser: any) => {
      if (authUser) {
        // User is logged IN
        localStorage.setItem("authUser", JSON.stringify(authUser));
        setUser(authUser);
      } else {
        // User is logged OUT
        localStorage.removeItem("authUser");
        setUser(null);

        // Check if the current route is protected
        const isProtectedRoute = !publicRoutes.includes(router.pathname);

        // If the user is on a protected route and not logged in, redirect to signup.
        // Otherwise, let them stay on the public page.
        if (isProtectedRoute) {
          router.push(ROUTES.SIGNUP);
        }
      }
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [router]);

  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${poppins.style.fontFamily};
          }
          `}</style>
      <SocketProvider>
        <Toaster position="top-center" richColors />
        {showLayout ? (
          <UserContext.Provider value={user}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </UserContext.Provider>
        ) : (
          <UserContext.Provider value={user}>
            <Component {...pageProps} />
          </UserContext.Provider>
        )}
      </SocketProvider>
    </>
  )
}
