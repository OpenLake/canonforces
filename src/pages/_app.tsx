import { useState, useEffect } from 'react';
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Poppins } from "@next/font/google";
import UserContext from '../context/user';
import {User} from "../types/user";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

const poppins = Poppins({
  weight: "500",
});

export default function App({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (authUser: any) => {
      if(authUser) {
        localStorage.setItem("authUser", JSON.stringify(authUser));
        setUser(authUser);
      } else {
        localStorage.removeItem("authUser");
        setUser(null);
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
      <UserContext.Provider value={user}>
        <Component {...pageProps} />
      </UserContext.Provider> 
    </>
  )
}
