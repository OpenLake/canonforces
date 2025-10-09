import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore"
import { db } from "../lib/firebase"



const handleSetFollow = async (userWhom: string, userTo: string) => {
    // update on FireStore
    try {
        const whomRef = doc(db, "users", userWhom);
        const toRef = doc(db, "users", userTo);
        await updateDoc(whomRef, {
            following: arrayUnion(userTo)
        });
        await updateDoc(toRef, {
            followers: arrayUnion(userWhom)
        });
    } catch (error) {
        throw error
    }
}


const handleSetUnfollow = async (userWhom: string, userTo: string) => {
    try {   
        const whomRef = doc(db, "users", userWhom);
        const toRef = doc(db, "users", userTo);
        await updateDoc(whomRef, {
            following: arrayRemove(userTo)
        });
        await updateDoc(toRef, {
            followers: arrayRemove(userWhom)
        });
    } catch (error) {
        throw error
    }
}


export {
    handleSetFollow,
    handleSetUnfollow
}