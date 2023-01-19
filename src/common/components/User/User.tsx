import Image from "next/image";
import styles from "./User.module.css";

export default function User() {
  return (
    <div className={styles.user}>
        <Image 
            width={37}
            height={37}
            alt="Canonforces"
            src={"/images/user1.jpeg"}
        />
        <div className={styles.user_details}>
            <h4> Michael </h4>
            <span> @michael </span>
        </div>
    </div>
  )
}