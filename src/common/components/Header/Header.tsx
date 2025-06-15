import Head from "next/head";
import Link from "next/link";
import * as ROUTES from "../../../constants/routes";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <>
    <div className={`flex w-10/12 p-5 fc-black font-light max-w-screen-2xl`}>  
        <nav className="flex flex-row w-full">
            <div className="basis-1/4 flex items-center justify-center">
              <ul className="flex-row flex w-full justify-around">
                <li> <Link href={ROUTES.DASHBOARD}> Dashboard </Link> </li>
                <li> <Link href={ROUTES.USERS}> Users </Link> </li>
              </ul>
            </div>
            <div className="basis-1/2 flex items-center justify-center">
              <ul className="flex-row flex w-full justify-around">
                <li className="font-semibold text-xl"> <Link href={ROUTES.HOME}> CANONFORCES </Link> </li>
              </ul>
            </div>
            <div className="basis-1/4 flex items-center justify-center">
              <ul className="flex-row flex w-full justify-around">
                <li> <Link href={ROUTES.SIGNUP}> Signup </Link> </li>
                <li> <Link href={ROUTES.LOGIN}> Login </Link> </li>
              </ul>
            </div>
        </nav>
    </div>
    </>
  )
};

