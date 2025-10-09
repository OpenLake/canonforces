// src/pages/suggestions.tsx
import { useEffect, useState } from "react";
import { getAllUsers } from "../services/firebase"; 
import { User } from "../types/user";
import UserSuggestionCard from "../common/components/Suggestions/UserSuggestions/UserSuggestions";
import useUser from "../hooks/use-user"; 



export default function SuggestionsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const { user: loggedInUser } = useUser() as { user: User };
  const [isLoading, setIsLoading] = useState(true); 


  useEffect(() => {
     if (!loggedInUser) return; 
    async function fetchUsers() {
      setIsLoading(true);
      try{
        const usersFromDb = await getAllUsers();
        console.log("Users from DB:", usersFromDb);
        const formattedUsers: User[] = usersFromDb.map((user: any) => ({
          userId: user.userId ?? "",
          username: user.username ?? "",
          email: user.email ?? "",
          dateCreated: user.dateCreated ?? "",
          ...user
        }))
          // filter out logged in user's profile
        .filter(user => user.userId !== loggedInUser?.userId);

        setUsers(formattedUsers);
      }
      catch(error){
        console.error("Error fetching users:", error);
      }
      finally{
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, [loggedInUser]);


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Suggestions</h1>

      {isLoading ? (
          <div className="p-6 text-center text-gray-500">
            Loading suggestions...
          </div>
        ) : (
          <div className="space-y-4">
            {users.map(user => {
              if (!user?.username || !user?.userId) return null;
              return (
                <div key={user.userId} className="flex justify-between items-center border p-3 rounded-lg shadow-sm">
                  <UserSuggestionCard user={user} />
                  <button className="bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600">
                    Follow
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
}
