import NavigationMenu from "../../common/components/NavigationMenu/NavigationMenu";
import Profile from "../../common/components/Profile/Profile";


export default function user() {
  return (
    <div className="flex">
        <NavigationMenu />
        <Profile />
    </div>
  )
};
