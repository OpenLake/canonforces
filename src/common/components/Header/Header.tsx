import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import * as ROUTES from "../../../constants/routes";
import NotificationBell from "../NotificationBell/NotificationBell";
import styles from "./Header.module.css";
import { useState,useEffect } from "react";

export default function Header() {

  const [userDetails , setUserdetails] = useState<any>(null);

  useEffect(() => {
    try{
      const data = localStorage.getItem("authUser");

      if(data){
        setUserdetails(JSON.parse(data));
      };
    }catch (e){
      console.log(e);
    }
  },[])
  
  return (
    <>
      <div className={`relative flex w-10/12 p-5 fc-black font-light max-w-screen-2xl mx-auto items-center`}>
        <div className="absolute -left-12">
          <Link href={ROUTES.HOME} className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="CanonForces Logo"
              width={65}
              height={65}
              className="object-contain transition-transform duration-300 hover:scale-110"
              priority
            />
          </Link>
        </div>
        <nav className="flex flex-row w-full items-center justify-between pl-16">
          <div className="flex-1 flex justify-center">
            <ul className="flex flex-row">
              <li className="font-semibold text-xl tracking-wide"> 
                <Link href={ROUTES.HOME}> LEARN & CODE </Link> 
              </li>
            </ul>
          </div>
          
          <div className="flex items-center gap-10">
              {(userDetails)?
              (
              <ul className="flex flex-row items-center gap-8 pr-20">
                <li className="text-gray-dark hover:text-black transform hover:-translate-y-0.5"><Link href={ROUTES.DASHBOARD}> Dashboard : {userDetails.displayName} </Link></li>
                </ul>
                ) :
              (<ul className="flex flex-row items-center gap-8 pr-20">
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

