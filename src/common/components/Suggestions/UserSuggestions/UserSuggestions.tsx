import User from "../../User/User";
import styles from "./UserSuggestions.module.css";

export default function UserSuggestions() {
  return (
    <div className={styles.user}>
        <User />
        <button className={styles.follow_button}> Follow </button>
    </div>
  )
};