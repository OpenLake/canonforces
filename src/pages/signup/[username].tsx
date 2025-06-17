import { useState, useContext } from "react";
import styles from "../../styles/Signup.module.css";
import { BsPatchExclamation, BsPatchCheck} from "react-icons/bs";
import { useRouter } from "next/router";
import { User } from "../../types/user";
import UserContext from "../../context/user";
import { db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";


export default function Username({}){
    const [username, setUsername] = useState('');
    const authUser = useContext(UserContext);

    const [error, setError] = useState(''); 
    const isInvalid = username === '';

    const router = useRouter();

    const getData = async () => { 
        // const currentTime = new Date().getTime();
        // console.log(currentTime);
    
        // const randomNumber = (): number => Math.floor(Math.random() * 1000000);
        // sha512Hex(${randomNumber}/user.info?apiKey=5bb4c6ecab438b6aa0beff73ac3e257115afb642&time=${currentTime}#874a1d7cde02549386ef85897bb65bf7d3ca4060)
        try {
            const res = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
            const data = await res.json(); 
            console.log(data.result[0]);
            if(data) {
                console.log(authUser);

                const newUser: User = {
                    fullname: authUser.displayName,
                    userId: authUser.uid,
                    username: data.result[0].handle,
                    dateCreated: new Date(),
                    email: authUser.email,
                    avatar: data.result[0].avatar,
                    followers: [],
                    following: []
                }

                setDoc(doc(db, "users"), newUser) 
                    .then((res) => {
                        console.log(res, "Written succesfully");
                    });
            }

        } catch (err: any) {
            setError(err.message);
        }        
        
    }

    return (
        <div className={styles.signup}>
            <div className={`${styles.container} flex w-5/12 items-center flex-col`}> 
                <div className={styles.username__div}>
                    <label className={styles.username__label2}> Codeforces Username </label>
                    <div className={styles.input2}>
                        <input 
                            className="shadow appearance-none text-sm rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                            id="username" 
                            name="username" 
                            placeholder="Username"
                            onChange={({target}) => setUsername(target.value)}
                        />
                        {username ? <BsPatchCheck className={styles.check__icon}/> : <BsPatchExclamation className={styles.exclaimation__icon}/>}
                    </div>
                    <div className={styles.form__buttons}>
                        <button className={styles.login__button} onClick={() => getData()} > Enter </button>
                    </div>
                </div>
            </div>  
            {/* <pre>{user.res} </pre> */}
        </div>
    )
};

