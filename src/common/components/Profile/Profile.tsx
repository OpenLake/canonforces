import { useState, useEffect } from "react";
import styles from "./Profile.module.css";
import useUser from "../../../hooks/use-user";
import { doesUsernameExists, updateUserProfile } from "../../../services/firebase";

// Extend the User type to include solvedQuestions
type User = {
  docId: string;
  username: string;
  fullname?: string;
  emailAddress?: string;
  photoURL?: string;
  followers?: string[];
  following?: string[];
  solvedQuestions?: string[];
};

export default function Profile() {
  const [userData, setUserData] = useState(null);
type CfData = {
  handle: string;
  rank?: string;
  rating?: number;
  maxRating?: number;
  // add other properties from Codeforces API if needed
};

const [cfData, setCfData] = useState<CfData | null>(null);
const [isEditing, setIsEditing] = useState(false);
const [editForm, setEditForm] = useState({
  fullname: '',
  emailAddress: '',
  photoURL: ''
});
const [loading, setLoading] = useState(false);

const { user } = useUser() as { user: User };

  // Fetch Codeforces data
  useEffect(() => {
    if (user?.username) {
      const fetchCfData = async () => {
        try {
          const response = await fetch(`https://codeforces.com/api/user.info?handles=${user.username}`);
          const data = await response.json();
          if (data.status === "OK") {
            setCfData(data.result[0]);
          }
        } catch (error) {
          console.error("Error fetching CF data:", error);
        }
      };
      fetchCfData();
    }
  }, [user?.username]);

  // Initialize edit form when user data changes
  useEffect(() => {
    if (user) {
      setEditForm({
        fullname: user?.fullname || '',
        emailAddress: user?.emailAddress || '',
        photoURL: user?.photoURL || ''
      });
    }
  }, [user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Reset form to current user data when starting edit
      setEditForm({
        fullname: user?.fullname || '',
        emailAddress: user?.emailAddress || '',
        photoURL: user?.photoURL || ''
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserProfile(user.docId, editForm);
      setIsEditing(false);
      // You might want to refresh the user data here
      window.location.reload(); // Simple refresh, you can implement a better way
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: string | undefined) => {
    const rankColors: Record<
      'newbie' | 'pupil' | 'specialist' | 'expert' | 'candidate master' | 'master' | 'international master' | 'grandmaster' | 'international grandmaster' | 'legendary grandmaster',
      string
    > = {
      'newbie': '#808080',
      'pupil': '#008000',
      'specialist': '#03A89E',
      'expert': '#0000FF',
      'candidate master': '#AA00AA',
      'master': '#FF8C00',
      'international master': '#FF8C00',
      'grandmaster': '#FF0000',
      'international grandmaster': '#FF0000',
      'legendary grandmaster': '#FF0000'
    };
    return rank ? rankColors[rank.toLowerCase() as keyof typeof rankColors] || '#000000' : '#000000';
  };

  if (!user) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.profile}>
      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
          <div className={styles.profileImage}>
            <img 
              src={user.photoURL || '/default-avatar.png'} 
              alt="Profile" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${user.fullname || user.username}&background=random`;
              }}
            />
          </div>
          <div className={styles.profileInfo}>
            <h1>Hey {user.fullname ? user.fullname.split(" ")[0] : user.username}!</h1>
            <span>Hope you are doing well!</span>
          </div>
          <button 
            className={styles.editButton}
            onClick={handleEditToggle}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className={styles.profileDetails}>
          {isEditing ? (
            <div className={styles.editForm}>
              <div className={styles.formGroup}>
                <label>Full Name:</label>
                <input
                  type="text"
                  name="fullname"
                  value={editForm.fullname}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Email Address:</label>
                <input
                  type="email"
                  name="emailAddress"
                  value={editForm.emailAddress}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Profile Picture URL:</label>
                <input
                  type="url"
                  name="photoURL"
                  value={editForm.photoURL}
                  onChange={handleInputChange}
                  placeholder="Enter image URL"
                />
              </div>
              
              <div className={styles.formButtons}>
                <button 
                  className={styles.saveButton}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.profileStats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Full Name:</span>
                <span className={styles.statValue}>{user.fullname || 'Not provided'}</span>
              </div>
              
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Username:</span>
                <span className={styles.statValue}>{user.username}</span>
              </div>
              
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Email:</span>
                <span className={styles.statValue}>{user.emailAddress || 'Not provided'}</span>
              </div>
              
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Questions Solved:</span>
                <span className={styles.statValue}>
                  {user.solvedQuestions ? user.solvedQuestions.length : 0}
                </span>
              </div>
              
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Followers:</span>
                <span className={styles.statValue}>
                  {user.followers ? user.followers.length : 0}
                </span>
              </div>
              
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Following:</span>
                <span className={styles.statValue}>
                  {user.following ? user.following.length : 0}
                </span>
              </div>
            </div>
          )}
        </div>

        {cfData && (
          <div className={styles.codeforcesSection}>
            <h3>Codeforces Profile</h3>
            <div className={styles.cfStats}>
              <div className={styles.cfRank}>
                <span className={styles.cfLabel}>Rank:</span>
                <span 
                  className={styles.cfValue}
                  style={{ color: getRankColor(cfData.rank) }}
                >
                  {cfData.rank || 'Not rated'}
                </span>
              </div>
              
              {cfData.rating && (
                <div className={styles.cfRating}>
                  <span className={styles.cfLabel}>Rating:</span>
                  <span className={styles.cfValue}>{cfData.rating}</span>
                </div>
              )}
              
              {cfData.maxRating && (
                <div className={styles.cfMaxRating}>
                  <span className={styles.cfLabel}>Max Rating:</span>
                  <span className={styles.cfValue}>{cfData.maxRating}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}