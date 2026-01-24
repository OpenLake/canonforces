'use client';

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import * as ROUTES from "../../../constants/routes";
import styles from "./NavigationMenu.module.css";
import Link from "next/link";
import { AiFillHome } from "react-icons/ai";
import { BsTrophy } from "react-icons/bs";
import { FaRegQuestionCircle, FaChartBar } from "react-icons/fa";
import { TbSwords } from "react-icons/tb";
import { IoMdLogOut } from "react-icons/io";
import User from "../User/User";
import { FaRegLightbulb } from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth, db } from "../../../lib/firebase";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function NavigationMenu() {
  const router = useRouter();
  const pathname = usePathname();

  const [dbUser, setDbUser] = useState<any>(null);
  const [newUsername, setNewUsername] = useState("");
  const [updateStatus, setUpdateStatus] = useState<{ error?: string; success?: string }>({});
  const [loading, setLoading] = useState(false);

  // Fetch user from Firestore
  useEffect(() => {
    const fetchUser = async () => {
      if (!auth.currentUser) return;
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) setDbUser(snap.data());
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };
    fetchUser();
  }, []);

  const isActive = (route: string) =>
    typeof pathname === "string" &&
    (pathname === route || pathname.startsWith(route + "/"));

  // Logout
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    await signOut(auth);
    router.push(ROUTES.LOGIN || "/login");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUsername(e.target.value);
    setUpdateStatus({});
  };

  // ✅ UPDATE USERNAME FUNCTION
  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUpdateStatus({});

    const trimmedUsername = newUsername.trim();
    if (!trimmedUsername) {
      setUpdateStatus({ error: "Please enter a username." });
      setLoading(false);
      return;
    }

    // Validate Codeforces username
    try {
      const res = await fetch(
        `https://codeforces.com/api/user.info?handles=${trimmedUsername}`
      );
      const data = await res.json();
      if (data.status !== "OK") {
        setUpdateStatus({ error: "Codeforces username not found." });
        setLoading(false);
        return;
      }
    } catch {
      setUpdateStatus({ error: "Failed to verify username." });
      setLoading(false);
      return;
    }

    // Update Firestore
    try {
      if (!auth.currentUser) throw new Error("User not logged in");
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { username: trimmedUsername });

      setDbUser((prev: any) => ({ ...prev, username: trimmedUsername }));
      setNewUsername("");
      setUpdateStatus({ success: "Username updated successfully!" });
    } catch (err: any) {
      console.error(err);
      setUpdateStatus({ error: "Failed to update username." });
    }

    setLoading(false);
  };

  return (
    <div className={styles.navigation}>
      {/* LOGO */}
      <Link href={ROUTES.DASHBOARD} className={styles.logo}>
        <Image width={55} height={55} alt="Canonforces" src="/images/logo.png" />
        <h3>Canonforces</h3>
      </Link>

      {/* MENU */}
      <div className={styles.navbar}>
        <h4>Menu</h4>
        <nav>
          <ul>
            <li className={isActive(ROUTES.DASHBOARD) ? styles.active : ""}>
              <Link href={ROUTES.DASHBOARD}>
                <AiFillHome /> <span>Home</span>
              </Link>
            </li>

            <li className={isActive(ROUTES.CONTESTS_LIST) ? styles.active : ""}>
              <Link href={ROUTES.CONTESTS_LIST}>
                <BsTrophy /> <span>Contests</span>
              </Link>
            </li>

            <li className={isActive(ROUTES.STATS) ? styles.active : ""}>
              <Link href={ROUTES.STATS}>
                <FaChartBar /> <span>Stats</span>
              </Link>
            </li>

            <li className={isActive(ROUTES.CONTESTS) ? styles.active : ""}>
              <Link href={ROUTES.CONTESTS}>
                <TbSwords /> <span>Practise</span>
              </Link>
            </li>

            <li className={isActive(ROUTES.POTD) ? styles.active : ""}>
              <Link href={ROUTES.POTD}>
                <FaRegLightbulb /> <span>POTD</span>
              </Link>
            </li>

            <li className={isActive(ROUTES.QUIZ) ? styles.active : ""}>
              <Link href={ROUTES.QUIZ}>
                <FaRegQuestionCircle /> <span>Quiz</span>
              </Link>
            </li>

            {/* ✅ UPDATE USERNAME (BELOW QUIZ) */}
            <li className={styles.update_section}>
              <form onSubmit={handleUpdateUsername}>
                <input
                  type="text"
                  value={newUsername}
                  onChange={handleInputChange}
                  placeholder={dbUser?.username || "Enter CF username"}
                  disabled={loading}
                />
                <button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update"}
                </button>

                {updateStatus.error && (
                  <p style={{ color: "red" }}>{updateStatus.error}</p>
                )}
                {updateStatus.success && (
                  <p style={{ color: "green" }}>{updateStatus.success}</p>
                )}
              </form>
            </li>
          </ul>
        </nav>
      </div>

      {/* USER SECTION (BELOW UPDATE OPTION) */}
      <div className={styles.user_section}>
        <User />
        <button className={styles.logout_button} onClick={handleLogout}>
          <IoMdLogOut />
        </button>
      </div>
    </div>
  );
}
