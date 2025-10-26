import styles from "./MainMenu.module.css";
import { IoNotifications } from "react-icons/io5";
import { RiSearch2Line } from "react-icons/ri";
import Suggestions from "../Suggestions/Suggestions";
import { useEffect, useState } from "react";
import { doesUsernameExists } from "../../../services/firebase";
import useUser from "../../../hooks/use-user";
import { getContestCount } from "../../../services/firebase";
import { getSolvedCount } from "../../../services/firebase";
import { useRouter } from "next/router";
import Image from "next/image";
import { getPOTD } from "../../../services/potd_fetch"; 
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";


const getSnippet = (text: string, length: number = 150) => {
  if (!text) return "";
  if (text.length <= length) return text;
  const plainText = text.replace(/<[^>]+>/g, ''); 
  return plainText.substring(0, length) + "...";
};


export default function MainMenu() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [potd, setPotd] = useState<any>(null);

  const user = useUser();
  console.log('user logged', user);

  useEffect(() => {
    const username = user.user?.username;
    if (typeof username === "string" && username.trim() !== "") {
      (async () => {
        const codeforcesData = await doesUsernameExists(username);
        const contests = await getContestCount(username);
        const solver = await getSolvedCount(username);
        console.log('solver logged', solver);
        setUserData({
          ...codeforcesData?.result[0],
          ...solver,
          contestsGiven: contests
        });
      })();
    }
  }, [user.user]);

  // --- UPDATED useEffect (copied logic from potd.tsx) ---
  useEffect(() => {
    async function fetchPOTD() {
      try {
        // Step 1: Get the POTD ID (which is a string)
        const problemId = await getPOTD();
        if (!problemId || typeof problemId !== "string") {
          throw new Error("Invalid POTD ID");
        }

        // Step 2: Use the ID to get the problem doc from Firestore
        const ref = doc(db, "problems", problemId);
        const snapshot = await getDoc(ref);
        if (!snapshot.exists()) {
          throw new Error("Problem not found");
        }

        // Step 3: Set the problem state
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
        
        <div className={styles.main_menu_stats}>
          <h3> Stats </h3>
          <div className={styles.user_stats}> 
            <div className={styles.stats}>
              <div className={styles.stats1}> 
                  <div className={styles.questions}>
                    <span className={styles.number}> {userData?.rank ? userData?.rank : "pupil"} </span>  <span> Rank</span>  
                  </div>
                  <div className={styles.questions}>
                    <span className={styles.number}> {userData?.solved ? userData?.solved : "0"} </span>  <span>Problems Solved </span>  
                    <span className={styles.number}>{userData?.attempt ? userData?.attempt : "0"} </span>  <span>Submissions </span>
                  </div> 
                  
              </div>
              <div className={styles.stats2}> 
                <div className={styles.ranking}>
                  <span className={styles.number}> {userData?.maxRating ? userData?.maxRating : "Rating"} </span> <span> Max Rating </span>
                </div>
                <div className={styles.contest}>
                  <span className={styles.number}> {userData?.contestsGiven ? userData?.contestsGiven : "0"} </span> <span> Contest played</span>
                  {/* <span className={styles.number}> {user.user?.contestWon ? user.user?.contestWon: "0"} </span> <span> Won </span> */}
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
                  {getSnippet(potd.description || "Loading problem...")}
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
        <Suggestions rating={userData?.rating} />
      </div>
    </div>
  )
}