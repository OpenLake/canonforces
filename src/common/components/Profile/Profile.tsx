import { Bar, Pie } from "react-chartjs-2";
import styles from "./Profile.module.css";
import { faker } from '@faker-js/faker';

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
  return (
    <div className={styles.profile}>
        <div className={styles.profile_stats}>
            <div className={styles.profile_user}>
                <h1> Hey Kanish </h1>
                <span> Hope you are doing well! </span>
            </div>
            <div className={styles.bar_chart}>
                <Bar options={options} data={data2}/>
            </div>
        </div>
        <div className={styles.sidebar}>
            <div className={styles.rank}>
                <Pie data={data} />
                <div> <span> 34 </span> Rank </div>
            </div>
            <div className={styles.user}>
                <div className={styles.followers}>
                    <span> 10 </span>
                    <span> followers </span>            
                </div>
                <div className={styles.following}>
                    <span> 20 </span>
                    <span> following </span>            
                </div>
            </div>
        </div>
   </div>
  )
};