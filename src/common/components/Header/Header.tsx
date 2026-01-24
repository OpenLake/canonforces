import Head from "next/head";
import Link from "next/link";
import * as ROUTES from "../../../constants/routes";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <>
      <div className={`flex w-10/12 p-5 fc-black font-light max-w-screen-2xl`}>
        <nav className="flex flex-row w-full items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <Link href={ROUTES.HOME} className="font-semibold text-xl">
              CANONFORCES
            </Link>
          </div>

          {/* Right side - Signup, Login */}
          <div className="flex items-center">
            <ul className="flex-row flex gap-6 items-center">
              <li> <Link href={ROUTES.SIGNUP}> Signup </Link> </li>
              <li> <Link href={ROUTES.LOGIN}> Login </Link> </li>
            </ul>
          </div>
        </nav>
      </div>
    </>
  )
};

