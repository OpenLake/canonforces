import { useState, useEffect, useContext } from "react";
import UserContext from "../context/user";
import { getUserByUserId } from "../services/firebase";


interface User {
  docId: string;
  username?: string;
  contestPlayed?: number;
  contestWon?: number;
}

export default function useUser() {
  const [activeUser, setActiveUser] = useState<User | undefined>();
  const user = useContext(UserContext);
  console.log('user logged1',user)
  useEffect(() => {
    async function getUserObjByUserId() {
      const [response] = await getUserByUserId(user.uid);
      setActiveUser(response);
    }

    if (user?.uid) {
      getUserObjByUserId();
    }
  }, [user]);

  console.log(activeUser?.username, activeUser?.contestPlayed, activeUser?.contestWon);

  return { user: activeUser };
}
