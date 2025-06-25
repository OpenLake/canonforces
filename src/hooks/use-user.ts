import { useState, useEffect, useContext } from "react";
import UserContext from "../context/user";
import { getUserByUserId } from "../services/firebase";


interface User {
  docId: string;
  username?: string;
  fullname?: string;
  contestPlayed?: number;
  contestWon?: number;
  followers?: any[];
  following?: any[];
}

export default function useUser() {
  const [activeUser, setActiveUser] = useState<User | undefined>();
  const user = useContext(UserContext);

  // console.log('user logged1',user)
  useEffect(() => {
    async function getUserObjByUserId() {
      const [response] = await getUserByUserId(user.uid);
      setActiveUser(response);
    }

    if (user?.uid) {
      getUserObjByUserId();
    }
  }, [user]);
  // console.log(activeUser?.docId)
  console.log("hook",activeUser)
  
  return { user: activeUser };
}
