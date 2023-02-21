import styles from "./MainMenu.module.css";
import { IoNotifications } from "react-icons/io5";
import { RiSearch2Line } from "react-icons/ri";
import Suggestions from "../Suggestions/Suggestions";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  BarElement,
  Filler,
  Tooltip,
  Legend,
  LinearScale,
} from 'chart.js';
import { Radar, Bubble , Bar} from 'react-chartjs-2';
import { faker } from '@faker-js/faker'
import { useEffect, useState } from "react";
import { doesUsernameExists } from "../../../services/firebase";
import useUser from "../../../hooks/use-user";
import { User } from "../../../types/user";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  CategoryScale,
  BarElement,
  LinearScale,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export const data = {
  labels: ['Thing 1', 'Thing 2', 'Thing 3', 'Thing 4', 'Thing 5', 'Thing 6'],
  datasets: [
    {
      label: '# of Votes',
      data: [2, 9, 3, 5, 2, 3],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
    },
  ],
}; // no of languages 

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

export const data2 = {
  labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
      label: 'Dataset 2',
      data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};


export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Chart.js Bar Chart',
    },
  },
};

export const options3 = {
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

export const data3 = {
  datasets: [
    {
      label: 'Red dataset',
      data: Array.from({ length: 50 }, () => ({
        x: faker.datatype.number({ min: -100, max: 100 }),
        y: faker.datatype.number({ min: -100, max: 100 }),
        r: faker.datatype.number({ min: 5, max: 20 }),
      })),
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
      label: 'Blue dataset',
      data: Array.from({ length: 50 }, () => ({
        x: faker.datatype.number({ min: -100, max: 100 }),
        y: faker.datatype.number({ min: -100, max: 100 }),
        r: faker.datatype.number({ min: 5, max: 20 }),
      })),
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};

export default function MainMenu() {

  const [userData, setUserData] = useState<any>(null);

  const user: any = useUser();
  console.log(user);

  useEffect( () => {
    if(user.user?.username) {
      (async () => {
        const codeforcesData = await doesUsernameExists(user.user?.username);
        setUserData(codeforcesData?.result[0]);
        console.log(codeforcesData);  
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
                    <span className={styles.number}> {userData?.contribution ? userData?.contribution : "0"} </span>  <span> Contributions </span>  
                  </div>
                  <div className={styles.questions}>
                    <span className={styles.number}> 3256 </span>  <span>Problems Solved </span>  
                    <span className={styles.number}> 4000 </span>  <span>Submissions </span>
                  </div> 
                  
              </div>
              <div className={styles.stats2}> 
                <div className={styles.ranking}>
                  <span className={styles.number}> {userData?.maxRating ? userData?.maxRating : "Improve your rating by plaing more"} </span> <span> Max Rating </span>
                </div>
                <div className={styles.contest}>
                  <span className={styles.number}> {user.user?.contestPlayed ? user.user?.contestPlayed : "0"} </span> <span> Contest played</span>
                  <span className={styles.number}> {user.user?.contestWon ? user.user?.contestWon: "0"} </span> <span> Won </span>
                </div> 
              </div>  
            </div>
            <div className={styles.languages_stat}>
              <Radar data={data} />
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