// components/Suggestions/Suggestions.tsx

import styles from "./Suggestions.module.css";
import UserSuggestionCard from "./UserSuggestions/UserSuggestions";
import { ContestsSidebar } from "../ContestsSidebar/ContestsSidebar";
import { SlGraph } from "react-icons/sl";
import { useEffect, useState } from "react";
import { getAllUsers } from "../../../services/firebase"; 
import { User } from "../../../types/user"; 
import Link from "next/link";
import { getAuth, onAuthStateChanged } from "firebase/auth";  //  Updated import


interface SuggestionsProps {
  rating?: number;
}

const maxUsersToShow = Math.floor(Math.random() * 2) + 5; // 5 or 6

export default function Suggestions({ rating }: SuggestionsProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid);

        // Fetch users only AFTER current user is known
        const usersFromDb = await getAllUsers();

        const formattedUsers: User[] = usersFromDb.map((user: any) => ({
          userId: user.userId ?? "",
          username: user.username ?? "",
          email: user.email ?? "",
          dateCreated: user.dateCreated ?? "",
          ...user,
        }));

        // Filter out the logged-in user
        const filteredUsers = formattedUsers.filter((u) => u.userId !== user.uid);

        // Randomize for dynamic suggestions
        const shuffledUsers = filteredUsers.sort(() => Math.random() - 0.5);

        setUsers(shuffledUsers);
      }
    });

    return () => unsubscribe();
  }, []);

  const displayedUsers = users.slice(0, maxUsersToShow);
  const hasMore = users.length > maxUsersToShow;


  return (
    <div className={styles.suggestions}>
      {/* Contests Sidebar */}
      

      <div className={styles.user}>
        <div className={styles.header}>
          <h1>Suggestion for you</h1>
          {hasMore && (
            <Link href="/suggestions">
              <span>See All</span>
            </Link>
          )}
        </div>

        <div className={styles.user_suggestions}>
          {displayedUsers.map(user => {
            if (!user?.username || !user?.userId) {
              return null;
            }
            return (
              <div key={user.userId} className={styles.user}>
                <UserSuggestionCard user={user} />
              </div>
            );
          })}
        </div>
      </div>
      
      <div className={styles.rating}>
        <h2>Rating</h2>
        <SlGraph size={"2.7em"} />
        <span>{rating ? rating : 0}</span>
      </div>

      <div className={styles.contestsSection}>
        <ContestsSidebar />
      </div>
    </div>
  );
}
