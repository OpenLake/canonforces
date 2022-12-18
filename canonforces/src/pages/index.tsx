import Header from "../common/components/Header/Header";
import Image from "next/image";
import styles from "../common/styles/Home.module.css";
import Footer from "../common/components/Footer/Footer";

export default function Home() {
  return (
    <div className="flex flex-col w-full items-center">
      <Header />
      <hr className="flex w-9/12 h-px fc-hr border-0"/> 
      <main className="flex flex-col w-full items-center p-0">
        <h1 className={`f-100 font-bold fc-black ${styles.fs_big}`}> LEARN & CODE </h1>
        {/* <hr className="flex h-px fc-hr border-0"/>   */}
        <hr className="flex w-9/12 h-px fc-hr border-0"/>
        <div className="flex w-9/12 justify-center">
          <div className="flex w-50 flex-col items-top">
            <p className={`fc-black ${styles.para}`}> 
              A coding platform where you can compete with 
              fellow coders, friends and random people to learn and improve your coding skills. 
              You can showcase your codeforces profile in an amazing dashboard powered by canonforces. 
            </p>
            <div className={`flex justify-between ${styles.buttons}`}>
              <button className={styles.button_blue}> Explore </button>   
              <button className={styles.button_black}> Dashboard </button>   
            </div>
          </div>
          <div className={`w-50 ${styles.image}`}>
            <Image  
              className="w-full"
              src="/images/image.png"
              width={800}
              height={800}
              alt="image"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
