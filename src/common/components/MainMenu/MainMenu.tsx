import styles from "./MainMenu.module.css";
import { IoNotifications } from "react-icons/io5";
import { RiSearch2Line } from "react-icons/ri";
import Suggestions from "../Suggestions/Suggestions";
import { useEffect, useState } from "react";
import { doesUsernameExists } from "../../../services/firebase";
import useUser from "../../../hooks/use-user";
import { getContestCount } from "../../../services/firebase";
import { getSolvedCount } from "../../../services/firebase";

import Image from "next/image";



export default function MainMenu() {

  const [userData, setUserData] = useState<any>(null);

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

  return (  
    <div className={styles.main}>
      <div className={styles.main_menu}>
        <div className={styles.main_menu_header}>
          <div className={styles.search}>
            <RiSearch2Line className={styles.search_icon} size={"1.3em"}/>
            <input type="text" name="search" className={styles.search} placeholder="Search"/>
          </div>
          <div className={styles.notification_icon}>
            <IoNotifications size={"1.2em"}/>
          </div>
        </div>
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
 <img
  src="/images/teacher.png"
  alt="Teacher"
  width={1000}
  height={1000}
  className={styles.teacherImg}
 
/>

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