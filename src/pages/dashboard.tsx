import MainMenu from "../common/components/MainMenu/MainMenu";
import styles from "../styles/Dashboard.module.css";
import useUser from "../hooks/use-user";  // or however you get current user

export default function Dashboard() {
  const user = useUser();

  // Optional: handle loading or missing username
  if (!user?.user?.username) {
    return <MainMenu username="" />;
  }

  return (
    <div className={styles.dashboard}>
      <MainMenu username={user.user.username} />
    </div>
  );
}