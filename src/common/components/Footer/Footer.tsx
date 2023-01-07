import styles from "./Footer.module.css";
import { AiFillTwitterCircle, AiFillLinkedin } from "react-icons/ai";
import { BsInstagram, BsFacebook } from "react-icons/bs";

export default function Footer() {
  return (
    <div className={styles.footer}>
      <div className={styles.footer__footer}>
        <div className={styles.playerTwo}>
          <h4> Canonforces </h4>
          <p>
            {" "}
            A paltform where you can showcase your codeforces profile in a more
            elegant way. You can compete with other coders in a 1v1 match and
            improve your profile.{" "}
          </p>
        </div>
        <div className={styles.company}>
          <h4> Company </h4>
          <ul>
            <li> About </li>
            <li> Privacy Policy </li>
            <li> Terms and Conditions </li>
          </ul>
        </div>
        <div className={styles.social}>
          <h4> Socials </h4>
          <div className={styles.socials}>
            <AiFillTwitterCircle size={"1.8em"} />
            <AiFillLinkedin size={"1.7em"} />
            <BsInstagram size={"1.6em"} />
            <BsFacebook size={"1.5em"} />
          </div>
        </div>
      </div>
      <hr className="w-3/6" />
      <div className={styles.footer__rights}>
        <h3> @2022 Canonforces Pvt. Ltd. All Rights Reserved </h3>
      </div>
    </div>
  );
}
