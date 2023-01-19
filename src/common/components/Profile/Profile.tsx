import { Bar, Pie } from "react-chartjs-2";
import styles from "./Profile.module.css";
import { faker } from '@faker-js/faker';
import useUser from "../../../hooks/use-user";

import {
    Chart as ChartJS,
    CategoryScale,
    BarElement,
    Tooltip,
    Legend,
    LinearScale,
    Title,
    ArcElement,
} from 'chart.js';
import { doesUsernameExists } from "../../../services/firebase";
import { useEffect, useState } from "react";


ChartJS.register(
    CategoryScale,
    BarElement,
    LinearScale,
    Tooltip,
    Legend,
    Title,
    ArcElement
);

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


export const data = {
    labels: ['Red'],
    datasets: [
      {
        label: '# of Votes',
        data: [12],
        backgroundColor: [
          'rgba(255, 255, 255, 0.2)',
        ],
        borderColor: [
          'rgb(255, 255, 255)',
        ],
        borderWidth: 1,
      },
    ],
};

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);

  const user = useUser();
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
    <div className={styles.profile}>
        <div className={styles.profile_stats}>
            <div className={styles.profile_user}>
                <h1> Hey {user.user?.fullname.split(" ")[0]} </h1>
                <span> Hope you are doing well! </span>
            </div>
            <div className={styles.bar_chart}>
                <Bar options={options} data={data2}/>
            </div>
        </div>
        <div className={styles.sidebar}>
            <div className={styles.rank}>
                <Pie data={data} />
                <div>
                  <span> Ranking </span>
                  <span> {userData?.rank ?  userData?.rank : "Do contests to improve your ranking"} </span> 
                </div>
            </div>
            <div className={styles.user}>
                <div className={styles.followers}>
                    <span> {user.user?.followers ? user.user?.followers.length : "0"}</span>
                    <span> followers </span>            
                </div>
                <div className={styles.following}>
                    <span> {user.user?.following ? user.user?.following.length : "0"} </span>
                    <span> following </span>            
                </div>
            </div>
        </div>
   </div>
  )
};