import styles from "./MainMenu.module.css";
import { IoNotifications } from "react-icons/io5";
import { RiSearch2Line, RiCalendarCheckLine } from "react-icons/ri";
import Suggestions from "../Suggestions/Suggestions";
import { useEffect, useState } from "react";
import { getOrUpdateUserStats } from "../../../services/firebase"; 
import useUser from "../../../hooks/use-user";
import { useRouter } from "next/router";
import Image from "next/image";
import { getPOTD } from "../../../services/potd_fetch";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

const CACHE_KEY = "user_stats_cache"; 

const getSnippet = (text: string, length: number = 120) => {
  if (!text) return "";
  const plainText = text.replace(/<[^>]+>/g, '');
  return plainText.length > length ? plainText.substring(0, length) + "..." : plainText;
};

const getTodayDate = () => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

export default function MainMenu() {
  const router = useRouter();

  const [userData, setUserData] = useState<any>(() => {
    if (typeof window !== "undefined") { 
      const cached = localStorage.getItem(CACHE_KEY);
      try { return cached ? JSON.parse(cached) : null; } 
      catch (error) { return null; }
    }
    return null;
  });

  const [potd, setPotd] = useState<any>(null);
  const user = useUser();

  useEffect(() => {
    const fetchStats = async () => {
      const username = user.user?.username;
      const docId = user.user?.docId; 

      if (typeof username === "string" && username.trim() !== "" && docId) {
        const stats = await getOrUpdateUserStats(username, docId);
        if (stats) {
          setUserData(stats);
          localStorage.setItem(CACHE_KEY, JSON.stringify(stats));
        }
      }
    };
    fetchStats();
  }, [user.user]); 

  useEffect(() => {
    async function fetchPOTD() {
      try {
        const problemId = await getPOTD();
        if (!problemId || typeof problemId !== "string") throw new Error("Invalid POTD ID");
        const ref = doc(db, "problems", problemId);
        const snapshot = await getDoc(ref);
        if (!snapshot.exists()) throw new Error("Problem not found");
        setPotd({ id: snapshot.id, ...(snapshot.data()) });
      } catch (err: any) {
        console.error("Failed to fetch POTD:", err.message);
      }
    }
    fetchPOTD();
  }, []);

  const handleSolveLocal = () => {
    if (potd?.id) router.push(`/questions/${potd.id}`);
  };

  const handleSolveCF = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (potd?.problemUrl) {
      window.open(potd.problemUrl, '_blank');
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.main_menu}>
        <div className={styles.main_menu_header}>
          <div className={styles.search} onClick={() => router.push("/search")}>
            <RiSearch2Line className={styles.search_icon} size={"1.3em"} />
            <input
              type="text"
              className={styles.search_input}
              placeholder="Search users..."
              readOnly
            />
          </div>
          <div className={styles.notification_icon}>
            <IoNotifications size={"1.2em"} />
          </div>
        </div>

        <div className={styles.main_menu_stats}>
          <h3> Stats </h3>
          <div className={styles.user_stats}>
            <div className={styles.stats}>
              <div className={styles.stats1}>
                <div className={styles.questions}>
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

        <div className={styles.potd_container}>
          <div className={styles.potd_card}>
            <div className={styles.potd_header_section}>
              <div className={styles.potd_badge}>
                <RiCalendarCheckLine className={styles.badge_icon} />
                <span>Problem of the Day</span>
              </div>
              <span className={styles.potd_date}>{getTodayDate()}</span>
            </div>

            <div className={styles.potd_content}>
              {potd ? (
                <>
                  <h4 className={styles.potd_title}>
                    {potd.title || "Problem Title"}
                  </h4>
                  <div className={styles.potd_meta}>
                    <span className={styles.rating_badge}>
                      Rating: {potd.rating || "800"}
                    </span>
                  </div>
                  <p className={styles.potd_snippet}>
                    {getSnippet(potd.description)}
                  </p>
                </>
              ) : (
                <div className={styles.loading_state}>
                  <div className={styles.loader}></div>
                  <p>Loading today's challenge...</p>
                </div>
              )}
            </div>

            <div className={styles.potd_actions}>
              <button 
                className={styles.btn_primary} 
                onClick={handleSolveLocal}
                disabled={!potd}
              >
                <span>Solve Challenge</span>
              </button>

              {potd?.problemUrl && (
                <button 
                  className={styles.btn_codeforces} 
                  onClick={handleSolveCF}
                  title="Open in Codeforces"
                >
                  <Image 
                    src="/logos/codeforces.png" 
                    alt="Codeforces" 
                    width={20} 
                    height={20}
                    className={styles.cf_logo}
                  />
                  <span>Codeforces</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.suggestions}>
        <Suggestions rating={userData?.rating} />
      </div>
    </div>
  )
}