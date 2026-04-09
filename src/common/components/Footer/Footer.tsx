import styles from './Footer.module.css';
import {AiFillTwitterCircle, AiFillLinkedin, AiFillGithub} from 'react-icons/ai';
import {BsInstagram, BsDiscord} from 'react-icons/bs';

export default function Footer() {
  return (
    <div className={styles.footer}>
      <div className={styles.footer__footer}>
        <div className={styles.playerTwo}>
          <h4> Canonforces </h4>
          <p>
            {' '}
            A paltform where you can showcase your codeforces profile in a more elegant way. 
            You can compete with other coders in a 1v1 match and improve your profile.{' '}
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
            <a href='https://x.com/OpenLakeClub' target='_blank' rel='noopener noreferrer'>
              <AiFillTwitterCircle size={'1.8em'} />
            </a>
            <a href='https://www.linkedin.com/company/openlake/' target='_blank' rel='noopener noreferrer'>
              <AiFillLinkedin size={'1.7em'} />
            </a>
            <a href='https://github.com/OpenLake' target='_blank' rel='noopener noreferrer'>
              <AiFillGithub size={'1.7em'} />
            </a>
            <a href='https://www.instagram.com/openlake_iitbhilai/' target='_blank' rel='noopener noreferrer'>
              <BsInstagram size={'1.6em'} />
            </a>
            <a href='https://discord.gg/eDYPDK2y' target='_blank' rel='noopener noreferrer'>
              <BsDiscord size={'1.6em'} />
            </a>
          </div>
        </div>
      </div>
      <hr className='w-3/6'/>
      <div className={styles.footer__rights}>
        <h3> @2022 Canonforces Pvt. Ltd. All Rights Reserved </h3>
      </div>
    </div>
  );
};
