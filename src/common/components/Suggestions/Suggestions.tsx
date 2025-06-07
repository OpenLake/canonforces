import Link from "next/link";
import styles from "./Suggestions.module.css";
import UserSuggestions from "./UserSuggestions/UserSuggestions";
import { SlGraph } from "react-icons/sl";

export default function Suggestions({ rating }: { rating?: number }) {
    return (
      <div className={styles.suggestions}>
        <div className={styles.user}>
          <div className={styles.header}>
            <h1> Suggestion for you </h1>
            <span> See All </span>
          </div>
          <div className={styles.user_suggestions}>
            <UserSuggestions />
            <UserSuggestions />
            <UserSuggestions />
            <UserSuggestions />
            <UserSuggestions />
            <UserSuggestions />
            <UserSuggestions />
          </div>
        </div>
        <div className={styles.rating}>
          <h2> Rating </h2>
          <SlGraph size={"2.7em"}/>
          <span> {rating ? rating: 0} </span>
        </div>
      </div>
    )
  }