import MainMenu from "../common/components/MainMenu/MainMenu";
import NavigationMenu from "../common/components/NavigationMenu/NavigationMenu";
import styles from "../styles/Dashboard.module.css";

export default function dashboard() {
  return (
    <div className={styles.dashboard}>
        <NavigationMenu />
        <MainMenu />
    </div>
  )
}