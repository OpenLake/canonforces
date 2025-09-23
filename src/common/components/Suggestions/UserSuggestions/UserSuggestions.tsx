// components/UserSuggestions/UserSuggestionCard.tsx

'use client';

import Image from "next/image";
import styles from "./UserSuggestions.module.css";
import { useRouter } from "next/navigation";
import { User } from "../../../../types/user"; // Adjust path as needed

interface UserSuggestionCardProps {
  user: User;
}

export default function UserSuggestionCard({ user }: UserSuggestionCardProps) {
  const router = useRouter();

  if (!user?.username || !user?.userId) {
    return <div>Loading user info...</div>;
  }

  const handleClick = () => {
    router.push(`/user/${user.userId}`);
  };

  return (
    <div className={styles.userd} onClick={handleClick} style={{ cursor: "pointer" }}>
      <Image
        width={37}
        height={37}
        alt={user.fullname || user.username}
        src={user.photoURL || "/images/user2.jpg"}
      />
      <div className={styles.user_details}>
        <h4>{user.fullname || user.username}</h4>
        <span>@{user.username}</span>
      </div>
    </div>
  );
}
