import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDebounce } from "use-debounce";
import styles from "../styles/Search.module.css";
import useUser from "../hooks/use-user";
import { User } from "../types/user";

export default function SearchPage() {
  const router = useRouter();
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 400);
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!debouncedQuery.trim() || !user?.docId) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Pass logged-in user's docId to exclude them from results
      const data = await getUsersByQuery(debouncedQuery, user.docId);
      setResults(data);
      setLoading(false);
    };

    fetchUsers();
  }, [debouncedQuery, user?.docId]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          placeholder="Search users by name or username..."
          className={styles.searchInput}
        />
        <button
          className={styles.closeBtn}
          onClick={() => router.push("/dashboard")}
        >
          ✕
        </button>
      </div>

      <div className={styles.results}>
        {loading && <p className={styles.loading}>Loading...</p>}

        {!loading && results.length === 0 && query && (
          <p className={styles.noResults}>No users found for "{query}"</p>
        )}

        {results.map((result) => (
          <div
            key={result.docId}
            className={styles.userCard}
            onClick={() => router.push(`/user/${result.docId}`)}
          >
            <img
              src={result.photoURL || "/images/user2.jpg"}
              alt={result.username || "user"}
              className={styles.avatar}
            />
            <div>
              <p className={styles.name}>{result.fullname || result.username}</p>
              <p className={styles.username}>@{result.username}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
