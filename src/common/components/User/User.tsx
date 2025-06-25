'use client';

import Image from "next/image";
import styles from "./User.module.css";
import useUser from "../../../hooks/use-user";
import { useRouter } from "next/navigation";

export default function User() {
  const { user } = useUser();
  const router = useRouter();

  if (!user?.username || !user?.fullname || !user?.docId) {
    return <div>Loading user info...</div>;
  }

  const handleClick = () => {
    router.push(`/user/${user.docId}`);
  };

  return (
    <div className={styles.userd} onClick={handleClick} style={{ cursor: "pointer" }}>
      <Image
        width={37}
        height={37}
        alt="Canonforces"
        src={"/images/user2.jpg"}
      />
      <div className={styles.user_details}>
        <h4>{user.fullname}</h4>
        <span>@{user.username}</span>
      </div>
    </div>
  );
}
