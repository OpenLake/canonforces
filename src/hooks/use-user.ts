import { useState, useEffect, useContext } from "react";
import UserContext from "../context/user";
import { getUserByUserId } from "../services/firebase";

export default function useUser() {
  const [activeUser, setAvtiveUser] = useState<any>();
  const user = useContext(UserContext);

  useEffect(() => {
    async function getUserObjByUserId() {
      // we need a func that gets user based on the id
      const [response] = await getUserByUserId(user.uid);
      setAvtiveUser(response);
    }
    if (user?.uid) {
      getUserObjByUserId();
    }
    ;
  }, [user]);

  return { user: activeUser };
}
