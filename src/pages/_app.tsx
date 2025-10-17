import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Poppins } from "next/font/google";
import * as ROUTES from "../constants/routes";
import { useRouter } from 'next/router';
import { AuthProvider, useAuth } from '../context/AuthContext'; // Import the new Provider
import Layout from '../common/components/Layout/Layout';
import { useEffect } from 'react';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500"],
});

// This is a new component to handle protected routes cleanly
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const publicRoutes = ['/', '/login', '/signup', '/questions/[id]'];
  const isProtectedRoute = !publicRoutes.includes(router.pathname);

  useEffect(() => {
    // If loading is finished and there's no user on a protected route, redirect
    if (!loading && !user && isProtectedRoute) {
      router.push(ROUTES.SIGNUP);
    }
  }, [user, loading, isProtectedRoute, router]);

  // If we are on a protected route and still loading or no user, don't render the page yet.
  // This prevents the protected page from flashing before redirect.
  if (isProtectedRoute && (loading || !user)) {
    return null; // Or a loading spinner component
  }
  
  return <>{children}</>;
}


export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const noLayoutRoutes = ['/', '/login', '/signup', '/questions/[id]', '/CompleteProfile'];
  const showLayout = !noLayoutRoutes.includes(router.pathname);

  return (
    <AuthProvider> {/* The Provider now wraps everything */}
      <style jsx global>{`
        html {
          font-family: ${poppins.style.fontFamily};
        }
      `}</style>
      
      <AuthGuard> {/* The Guard protects the children components */}
        {showLayout ? (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        ) : (
          <Component {...pageProps} />
        )}
      </AuthGuard>
    </AuthProvider>
  );
}