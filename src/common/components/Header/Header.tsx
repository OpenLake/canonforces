import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect,useState } from "react";
import * as ROUTES from "../../../constants/routes";
import NotificationBell from "../NotificationBell/NotificationBell";
import styles from "./Header.module.css";


export default function Header() {

  const [userDetail, setUserDetail] = useState<any>(null);

  useEffect(() => {
      try {
          const data = localStorage.getItem("authUser");

          if (data) {
              setUserDetail(JSON.parse(data));
          }
      } catch (e) {
          console.log(e);
      }
  }, []);
  
  return (
    <>
      <div className="relative flex p-2 mb-3 mt-3 fc-black font-light items-center sm:w-full justify-between w-full lg:w-10/12 max-w-screen-2xl lg:p-5 lg:mb-0 lg:mt-0">
        <div className="absolute mr-4 lg:m-0">
          <Link href={ROUTES.HOME} className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="CanonForces Logo"
              width={65}
              height={65}
              className="w-12 h-12 lg:w-[65px] lg:h-[65px] object-contain transition-transform duration-300 hover:scale-110"
              priority
            />
          </Link>
        </div>

        <nav className="flex flex-row w-full items-center justify-center lg:justify-between pl-16 ml-2 lg:ml-0">

          <div className="flex-1 flex justify-center">
            <ul className="flex flex-row">
              <li className="font-semibold text-sm tracking-wide lg:text-xl"> 
                <Link href={ROUTES.HOME}> LEARN & CODE </Link> 
              </li>
            </ul>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-10">
              {(userDetail)?
              (
              <ul className="text-xs flex flex-row items-center gap-3 lg:text-base lg:gap-8">
                <li className="text-gray-dark hover:text-black transform hover:-translate-y-0.5"><Link href={ROUTES.DASHBOARD}> Dashboard </Link></li>
              </ul>
                ) :
              (<ul className="text-xs flex flex-row items-center gap-3 lg:text-base lg:gap-8 lg:pr-20">
                <li> <Link href={ROUTES.LOGIN}> Login </Link> </li>
                <li> <Link href={ROUTES.SIGNUP}> Signup </Link> </li>
              </ul>
              )
            }
          </div>

        </nav>

      </div>
    </>
  )
};