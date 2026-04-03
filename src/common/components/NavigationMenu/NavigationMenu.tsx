import Image from "next/image";
import { useRouter } from "next/router";
import * as ROUTES from "../../../constants/routes";
import styles from "./NavigationMenu.module.css";
import Link from "next/link";
import { AiFillHome } from "react-icons/ai";
import { BsTrophy } from "react-icons/bs";
import { FaRegAddressBook, FaRegBookmark, FaRegQuestionCircle, FaUser } from "react-icons/fa";
import { TbSwords } from "react-icons/tb";
import { IoMdLogOut } from "react-icons/io";
import { FaChartBar, FaAward } from 'react-icons/fa';
import User from "../User/User";
import { FaRegLightbulb, FaCog } from 'react-icons/fa';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../lib/firebase"; // Adjust path if needed
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function NavigationMenu() {
  const router = useRouter();
  const { pathname } = router;
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists() && userDocSnap.data().isAdmin === true) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Helper: highlights tab for exact route or subroutes (e.g. /dashboard/settings)
  const isActive = (route: string) => pathname === route || pathname.startsWith(route + "/");

  // Logout handler
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    try {
      await signOut(auth);
      router.push(ROUTES.LOGIN || "/login");
    } catch (error) {
      alert("Logout failed. Try again.");
      console.error(error);
    }
  };

  return (
    <div className={styles.navigation}>
      <Link href={ROUTES.DASHBOARD} className={styles.logo}>
        <Image
          width={55}
          height={55}
          alt="Canonforces"
          src={"/images/logo.png"}
        />
        <h3>Canonforces</h3>
      </Link>
      <div className={styles.navbar}>
        <h4> Menu </h4>
        <nav>
          <ul>
            <li className={isActive(ROUTES.DASHBOARD) ? styles.active : ''}>
              <Link href={ROUTES.DASHBOARD}>
                <AiFillHome size={"1.5em"} /> <span>Home</span>
              </Link>
            </li>
            <li className={isActive(ROUTES.CONTESTS_LIST) ? styles.active : ''}>
              <Link href={ROUTES.CONTESTS_LIST}>
                <BsTrophy size={"1.5em"} /> <span>Contests</span>
              </Link>
            </li>
            <li className={isActive(ROUTES.STATS) ? styles.active : ''}>
              <Link href={ROUTES.STATS}>
                <FaChartBar size={"1.5em"} /> <span>Compare</span>
              </Link>
            </li>
            <li className={isActive(ROUTES.LEADERBOARD) ? styles.active : ''}>
              <Link href={ROUTES.LEADERBOARD}>
                <FaAward size={"1.5em"} /> <span>Leaderboard</span>
              </Link>
            </li>
            <li className={isActive(ROUTES.CONTESTS) ? styles.active : ''}>
              <Link href={ROUTES.CONTESTS}>
                <TbSwords size={"1.5em"} /> <span>Practise</span>
              </Link>
            </li>
            <li className={isActive(ROUTES.POTD) ? styles.active : ''}>
              <Link href={ROUTES.POTD}>
                <FaRegLightbulb size="1.5em" /> <span>POTD</span>
              </Link>
            </li>
            <li className={isActive(ROUTES.QUIZ) ? styles.active : ''}>
              <Link href={ROUTES.QUIZ}>
                <FaRegQuestionCircle size="1.5em" /> <span>Quiz</span>
              </Link>
            </li>
            {isAdmin && (
              <li className={isActive('/admin/potd') ? styles.active : ''} style={{ marginTop: 'auto', borderTop: '1px solid #334155', paddingTop: '10px' }}>
                <Link href="/admin/potd" style={{ color: '#f59e0b' }}>
                  <FaCog size="1.5em" /> <span style={{ fontWeight: 'bold' }}>Admin Portal</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
      <div className={styles.user_section}>
        <User />
        <button
          className={styles.logout_button}
          onClick={handleLogout}
          title="Logout"
        >
          <IoMdLogOut size={"1em"} className={styles.logout_icon} />
        </button>
      </div>
    </div>
  );
}
