import { useState, useEffect } from 'react';
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Poppins } from "@next/font/google";
import * as ROUTES from "../constants/routes";
import UserContext from '../context/user';
import {User} from "../types/user";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter }from 'next/router';
import Layout from '../common/components/Layout/Layout';

const poppins = Poppins({
  weight: "500",
});

export default function App({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const noLayoutRoutes = ['/', '/login', '/signup','/questions/[id]'];

  // Check if current route is in the list
  const showLayout = !noLayoutRoutes.includes(router.pathname);

  useEffect(() => {
    onAuthStateChanged(auth, (authUser: any) => {
      if(authUser) {
        localStorage.setItem("authUser", JSON.stringify(authUser));
        setUser(authUser);
      } else {
        localStorage.removeItem("authUser");
        setUser(null);
        router.push(ROUTES.SIGNUP);
      }
    })
  }, []);

  return (
    <>
   
      <style jsx global>{`
        html {
          font-family: ${poppins.style.fontFamily};
          }
          `}</style>
        {showLayout ? (
          <Layout>
          
            <UserContext.Provider value={user}>
              <Component {...pageProps} />
            </UserContext.Provider>
           
          </Layout>
        ) : (
          <UserContext.Provider value={user}>
            <Component {...pageProps} />
          </UserContext.Provider>

        )}
    </>
  )
}