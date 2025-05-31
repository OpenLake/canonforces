import Image from "next/image";
import { useState } from "react";
import * as ROUTES from "../../../constants/routes";
import styles from "./NavigationMenu.module.css";
import Link from "next/link";
import { AiFillHome } from "react-icons/ai";
import { SiGooglemessages } from "react-icons/si";
import { FaUser } from "react-icons/fa";
import { TbSwords } from "react-icons/tb";
import { IoMdLogOut } from "react-icons/io";
import User from "../User/User";

export default function NavigationMenu() {
    const [active,setActive]=useState(1)
  return (
    <div className={styles.navigation}>
        <div className={styles.logo}>
            <Image 
                width={55}
                height={55}
                alt="Canonforces"
                src={"/images/logo.png"}
            />
            <h3> Canonforces </h3>
        </div>
        <div className={styles.navbar}>
            <h4> Menu </h4> 
            <nav>
                <ul>
                    <li className={active==1 ? styles.active :''} onClick={()=>setActive(1)}> <Link href={ROUTES.DASHBOARD}> <AiFillHome size={"1.5em"}/> <span>  Home </span> </Link></li>
                    <li className={active==2 ? styles.active :''} onClick={()=>setActive(2)}> <Link href={ROUTES.MESSAGES}> <SiGooglemessages size={"1.5em"}/> <span> Messages </span> </Link></li>
                    <li className={active==3 ? styles.active :''} onClick={()=>setActive(3)}> <Link href={ROUTES.PROFILE}> <FaUser size={"1.5em"}/> <span> Profile </span> </Link></li>
                    <li className={active==4 ? styles.active :''} onClick={()=>setActive(4)}> <Link href={ROUTES.CONTESTS}> <TbSwords size={"1.5em"}/> <span> Contest </span> </Link></li>
                </ul>
            </nav>
        </div>
        <div className={styles.user_section}>
            <User />
            <IoMdLogOut size={"1.4em"} className={styles.logout}/>
        </div>
    </div>
  )
};

