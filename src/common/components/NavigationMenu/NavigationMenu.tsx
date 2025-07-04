import Image from "next/image";
import { useRouter } from "next/router";
import * as ROUTES from "../../../constants/routes";
import styles from "./NavigationMenu.module.css";
import Link from "next/link";
import { AiFillHome } from "react-icons/ai";
import { SiGooglemessages } from "react-icons/si";
import { FaUser } from "react-icons/fa";
import { TbSwords } from "react-icons/tb";
import { IoMdLogOut } from "react-icons/io";
import { FaChartBar } from 'react-icons/fa';
import User from "../User/User";
import { FaRegLightbulb } from 'react-icons/fa';

export default function NavigationMenu() {
    const router = useRouter();
    const { pathname } = router;

    // Helper: highlights tab for exact route or subroutes (e.g. /dashboard/settings)
    const isActive = (route: string) => pathname === route || pathname.startsWith(route + "/");

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
                        <li className={isActive(ROUTES.DASHBOARD) ? styles.active : ''}>
                            <Link href={ROUTES.DASHBOARD}>
                                <AiFillHome size={"1.5em"}/> <span>Home</span>
                            </Link>
                        </li>
                        <li className={isActive(ROUTES.MESSAGES) ? styles.active : ''}>
                            <Link href={ROUTES.MESSAGES}>
                                <SiGooglemessages size={"1.5em"}/> <span>Messages</span>
                            </Link>
                        </li>
                        <li className={isActive(ROUTES.STATS) ? styles.active : ''}>
                            <Link href={ROUTES.STATS}>
                                <FaChartBar size={"1.5em"}/> <span>Stats</span>
                            </Link>
                        </li>
                        <li className={isActive(ROUTES.CONTESTS) ? styles.active : ''}>
                            <Link href={ROUTES.CONTESTS}>
                                <TbSwords size={"1.5em"}/> <span>Practise</span>
                            </Link>
                        </li>
                        <li className={isActive(ROUTES.POTD) ? styles.active : ''}>
                            <Link href={ROUTES.POTD}>
                                <FaRegLightbulb size="1.5em" /> <span>POTD</span>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
            <div className={styles.user_section}>
                <User />
                <IoMdLogOut size={"1.4em"} className={styles.logout}/>
            </div>
        </div>
    );
}
