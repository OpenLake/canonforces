import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
// import { User } from "../types/user";s
import { auth } from "../lib/firebase";

// type userObj = string | null;
// let userObj = '';

// const useAuthListener = () => {
//     const [user, setUser] = useState(userObj !== null ? JSON.parse(userObj || '{}') : null);
//     useEffect(() => {
//         if(typeof window !== undefined) {
//             userObj = localStorage.getItem('authUser')!;
//         }        
//         const listener = onAuthStateChanged(auth, (authUser) => {
//             if(authUser) {
//                 localStorage.setItem("authUser", JSON.stringify(authUser));
//                 setUser(authUser);
//             } else {
//                 localStorage.removeItem("authUser");
//                 setUser(null);
//             }
//         });
        
//         return () => {
//             listener();
//         }
//     }, [auth, onAuthStateChanged]);

//     return { user };
// };

// export default useAuthListener;