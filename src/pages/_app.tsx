import "../common/styles/globals.css";
import type { AppProps } from "next/app";
import { Poppins } from "@next/font/google";
import UserContext from '../context/user';
import useAuthListener from '../hooks/use-auth-listener'; 
import {User} from "../types/user";

const poppins = Poppins({
  weight: "500",
});

export default function App({ Component, pageProps }: AppProps) {
  const { user } = useAuthListener();
  
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
  );
}
