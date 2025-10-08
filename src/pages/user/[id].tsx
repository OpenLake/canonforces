import { useRouter } from 'next/router';
import Profile from "../../common/components/Profile/Profile";


export default function User() {
  const router = useRouter();
  const { id } = router.query; 

  return (
    
        <Profile userId = {id as string} />
   
  )
};
