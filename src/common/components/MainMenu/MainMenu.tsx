import styles from "./MainMenu.module.css";
import { IoNotifications } from "react-icons/io5";
import { RiSearch2Line } from "react-icons/ri";
import Suggestions from "../Suggestions/Suggestions";
import { useEffect, useState } from "react";
import { getOrUpdateUserStats } from "../../../services/firebase"; 
import useUser from "../../../hooks/use-user";
import { useRouter } from "next/router";
import Image from "next/image";
import { getPOTD } from "../../../services/potd_fetch";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

const CACHE_KEY = "user_stats_cache"; // Key for local storage

const getSnippet = (text: string, length: number = 150) => {
  if (!text) return "";
  if (text.length <= length) return text;
  const plainText = text.replace(/<[^>]+>/g, '');
  return plainText.substring(0, length) + "...";
};

export default function MainMenu() {
  const router = useRouter();

  // --- 1. INITIALIZE STATE FROM CACHE ---
  const [userData, setUserData] = useState<any>(() => {
    if (typeof window !== "undefined") { // Check if running in browser
      const cached = localStorage.getItem(CACHE_KEY);
      try {
        return cached ? JSON.parse(cached) : null;
      } catch (error) {
        console.error("Error parsing user stats cache", error);
        return null;
      }
    }
    return null;
  });

  const [potd, setPotd] = useState<any>(null);
  const user = useUser();

  // --- UPDATED STATS FETCHING LOGIC ---
  useEffect(() => {
    const fetchStats = async () => {
      const username = user.user?.username;
      const docId = user.user?.docId; 

      if (typeof username === "string" && username.trim() !== "" && docId) {
        const stats = await getOrUpdateUserStats(username, docId);
        
        if (stats) {
          setUserData(stats);
          // --- 2. SAVE NEW DATA TO CACHE ---
          localStorage.setItem(CACHE_KEY, JSON.stringify(stats));
        }
      }
    };

    fetchStats();
  }, [user.user]); 
  // ------------------------------------

  // --- EXISTING POTD LOGIC (Unchanged) ---
  useEffect(() => {
    async function fetchPOTD() {
      try {
        const problemId = await getPOTD();
        if (!problemId || typeof problemId !== "string") {
          throw new Error("Invalid POTD ID");
        }
        const ref = doc(db, "problems", problemId);
        const snapshot = await getDoc(ref);
        if (!snapshot.exists()) {
          throw new Error("Problem not found");
        }
        setPotd({ id: snapshot.id, ...(snapshot.data()) });
      } catch (err: any) {
        console.error("Failed to fetch POTD:", err.message || "Error fetching POTD");
      }
    }
    fetchPOTD();
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.main_menu}>
        {/* search bar */}
        <div className={styles.main_menu_header}>
          <div className={styles.search} onClick={() => router.push("/search")}>
            <RiSearch2Line className={styles.search_icon} size={"1.3em"} />
            <input
              type="text"
              className={styles.search}
              placeholder="Search users..."
              readOnly
            />
          </div>
          <div className={styles.notification_icon}>
            <IoNotifications size={"1.2em"} />
          </div>
        </div>

        {/* stats */}
        <div className={styles.main_menu_stats}>
          <h3> Stats </h3>
          <div className={styles.user_stats}>
            <div className={styles.stats}>
              <div className={styles.stats1}>
                <div className={styles.questions}>
                  {/* Now uses cached data immediately on load */}
                  <span className={styles.number}> {userData?.rank ?? "pupil"} </span>  <span> Rank</span>
                </div>
                <div className={styles.questions}>
                  <span className={styles.number}> {userData?.solved ?? "0"} </span>  <span>Problems Solved </span>
                  <span className={styles.number}>{userData?.attempt ?? "0"} </span>  <span>Submissions </span>
                </div>

              </div>
              <div className={styles.stats2}>
                <div className={styles.ranking}>
                  <span className={styles.number}> {userData?.maxRating ?? "Rating"} </span> <span> Max Rating </span>
                </div>
                <div className={styles.contest}>
                  <span className={styles.number}> {userData?.contestsGiven ?? "0"} </span> <span> Contest played</span>
                </div>
              </div>
            </div>
            <div className={styles.languages_stat}>
              <Image
                src="/images/teacher.png"
                alt="Teacher"
                width={900}
                height={900}
                className={styles.teacherImg}
              />
            </div>
          </div>
        </div>

        {/* --- POTD SNIPPET --- */}
        <div
          className={styles.upcoming_contests}
          onClick={() => router.push("/potd")}
        >
          <div className={styles.potd_header}>
            <h3>Problem of the Day</h3>
          </div>

          <div className={styles.potd_body}>
            {potd ? (
              <>
                <h4 className={styles.potd_title}>
                  {potd.title || "Problem Title"}
                </h4>
                <p className={styles.potd_snippet}>
                  {getSnippet(potd.description) || "Loading problem..."}
                </p>
              </>
            ) : (
              <p className={styles.potd_snippet}>Loading Problem of the Day...</p>
            )}
          </div>

          <button className={styles.potd_button}>
            Solve Problem
          </button>
        </div>
        {/* --- END POTD SNIPPET --- */}

      </div>
      <div className={styles.suggestions}>
        {/* userData will now have cached values, so suggestions load smoothly too */}
        <Suggestions rating={userData?.rating} />
      </div>
    </div>
  )
}