// components/UserSuggestions/UserSuggestionCard.tsx

"use client";

import Image from "next/image";
import styles from "./UserSuggestions.module.css";
import btnStyle from "../Suggestions.module.css";
import { useRouter } from "next/navigation";
import { User } from "../../../../types/user"; // Adjust path as needed
import useUser from "../../../../hooks/use-user";
import { useMemo, useState,useEffect } from "react";
import {
  handleSetFollow,
  handleSetUnfollow,
} from "../../../../services/follow";

interface UserSuggestionCardProps {
  user: User;
}

export default function UserSuggestionCard({ user }: UserSuggestionCardProps) {
  const router = useRouter();
  const { user: activeUser } = useUser();
  console.log("activeUser", activeUser);

  const [isFollow, setIsFollow] = useState(false);
  
  
  useEffect(() => {
    if (activeUser?.following?.includes(user.userId)) {
      setIsFollow(true);
    } else {
      setIsFollow(false);
    }
  }, [activeUser?.following, user.userId]);

  const followText = useMemo(() => {
    if (isFollow) {
      return "Following";
    } else {
      return "Follow";
    }
  }, [isFollow]);

  const handleClick = () => {
    console.log("user for click", user);
    
    router.push(`/user/${user.userId}`);
  };

  const handleFollowBtn = async () => {
    try {
      if (isFollow) {
        await handleSetUnfollow(activeUser.docId, user.userId);
      } else {
        await handleSetFollow(activeUser.docId, user.userId);
      }

      setIsFollow(!isFollow);
    } catch (error) {
      alert(error);
      console.error("Error following user:", error);
    }
  };

  if (!user?.username || !user?.userId ) {
    return null;
  }


  return (
    <div className={styles.userd}>
      <div
        className={styles.userd}
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      >
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
        <button onClick={handleFollowBtn} className={btnStyle.follow_button}>
          {followText}
        </button>
    </div>
  );
}
