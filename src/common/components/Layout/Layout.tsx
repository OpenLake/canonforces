import NavigationMenu from "../NavigationMenu/NavigationMenu";
import styles from './Layout.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
<<<<<<< HEAD
   
    <div className={styles.layout}>
      <NavigationMenu />
    <main className={styles.main}>{children}</main>
    </div>
     
=======
    <>
    <div className={styles.layout}>
      <NavigationMenu />
    </div>
      <main className={styles.main}>{children}</main>
      </>
>>>>>>> 83e4f7c (Sidebar is now fixed)
  );
}
