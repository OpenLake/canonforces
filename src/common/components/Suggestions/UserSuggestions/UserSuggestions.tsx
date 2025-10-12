// components/UserSuggestions/UserSuggestionCard.tsx

"use client";

import Image from "next/image";
import styles from "./UserSuggestions.module.css";
import btnStyle from "../Suggestions.module.css"; // We will create/update this file
import { useRouter } from "next/navigation";
import { User } from "../../../../types/user";
import useUser from "../../../../hooks/use-user";
import { useMemo, useState, useEffect } from "react";
import { handleSetFollow, handleSetUnfollow } from "../../../../services/follow";

interface UserSuggestionCardProps {
  user: User;
}

export default function UserSuggestionCard({ user }: UserSuggestionCardProps) {
  const router = useRouter();
  const { user: activeUser } = useUser();

  const [isFollow, setIsFollow] = useState(false);
  // ✅ State to track hover on the button
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Determine the initial follow state
    setIsFollow(activeUser?.following?.includes(user.userId) || false);
  }, [activeUser?.following, user.userId]);

  // ✅ Updated logic for dynamic text
  const followText = useMemo(() => {
    if (isFollow) {
      return isHovering ? "Unfollow" : "Following";
    }
    return "Follow";
  }, [isFollow, isHovering]);

  const handleClick = () => {
    router.push(`/user/${user.userId}`);
  };

  const handleFollowBtn = async () => {
    if (!activeUser) {
      console.error("Cannot follow/unfollow: User is not logged in.");
      return;
    }

    try {
      if (isFollow) {
        await handleSetUnfollow(activeUser.docId, user.userId);
      } else {
        await handleSetFollow(activeUser.docId, user.userId);
      }
      setIsFollow((prev) => !prev);
    } catch (error) {
      alert(error);
      console.error("Error following user:", error);
    }
  };

  if (!user?.username || !user?.userId) {
    return null;
  }

  // ✅ Logic to determine button style dynamically
  const buttonClassName = `${btnStyle.follow_button} ${isFollow ? btnStyle.following : btnStyle.follow}`;

  return (
    <div className={styles.userd}>
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
      <button
        onClick={handleFollowBtn}
        className={buttonClassName}
        disabled={!activeUser}
        // ✅ Add hover event listeners
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {followText}
      </button>
    </div>
  );
}