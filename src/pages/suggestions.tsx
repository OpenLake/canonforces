// src/pages/suggestions.tsx
import { useEffect, useState } from "react";
import { getAllUsers } from "../services/firebase"; 
import { User } from "../types/user";
 import UserSuggestionCard from "../common/components/Suggestions/UserSuggestions/UserSuggestions";



export default function SuggestionsPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      const usersFromDb = await getAllUsers();
      const formattedUsers: User[] = usersFromDb.map((user: any) => ({
        userId: user.userId ?? "",
        username: user.username ?? "",
        email: user.email ?? "",
        dateCreated: user.dateCreated ?? "",
        ...user
      }));
      setUsers(formattedUsers);
    }
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Suggestions</h1>
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
    </div>
  );
}
