// components/Suggestions/Suggestions.tsx

import styles from "./Suggestions.module.css";
import UserSuggestionCard from "./UserSuggestions/UserSuggestions";
import { SlGraph } from "react-icons/sl";
import { useEffect, useState } from "react";
import { getAllUsers } from "../../../services/firebase"; // Adjust path as needed
import { User } from "../../../types/user"; 

interface SuggestionsProps {
  rating?: number;
}

const MAX_INITIAL_USERS = 4; // Show only 4 users initially

export default function Suggestions({ rating }: SuggestionsProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      const usersFromDb = await getAllUsers();
      const formattedUsers: User[] = usersFromDb.map((user: any) => ({
        userId: user.userId ?? "",
        username: user.username ?? "",
        email: user.email ?? "",
        dateCreated: user.dateCreated ?? "",
        ...user
      }));
      setUsers(formattedUsers);
    }
    fetchUsers();
  }, []);

  const displayedUsers = showAll ? users : users.slice(0, MAX_INITIAL_USERS);
  const hasMore = users.length > MAX_INITIAL_USERS;

  const handleReadMore = () => {
    setShowAll(!showAll);
  };

  return (
    <div className={styles.suggestions}>
      <div className={styles.user}>
        <div className={styles.header}>
          <h1>Suggestion for you</h1>
          <span>See All</span>
        </div>
        <div className={`${styles.user_suggestions} ${showAll ? styles.expanded : ''}`}>
          {displayedUsers.map(user => (
            <div key={user.userId} className={styles.user}>
              <UserSuggestionCard user={user} />
              <button className={styles.follow_button}>Follow</button>
            </div>
          ))}
        </div>
        {hasMore && (
          <button className={styles.read_more} onClick={handleReadMore}>
            {showAll ? 'Show less' : `Read more (${users.length - MAX_INITIAL_USERS} more)`}
          </button>
        )}
      </div>
      
      <div className={styles.rating}>
        <h2>Rating</h2>
        <SlGraph size={"2.7em"} />
        <span>{rating ? rating : 0}</span>
      </div>
    </div>
  );
}