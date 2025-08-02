import { useState, useEffect } from "react";
import Image from 'next/image';
import styles from "./Profile.module.css";
import useUser from "../../../hooks/use-user";
import { updateUserProfile } from "../../../services/firebase";

// --- TYPE DEFINITIONS (Unchanged) ---
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

type CfData = {
  handle: string;
  rank?: string;
  rating?: number;
  maxRating?: number;
};

export default function Profile() {
  // --- STATE AND HOOKS (Unchanged) ---
  const { user } = useUser() as { user: User };
  const [cfData, setCfData] = useState<CfData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullname: '',
    emailAddress: '',
    photoURL: ''
  });
  const [loading, setLoading] = useState(false);

  // --- LOGIC AND EFFECTS (Unchanged) ---
  useEffect(() => {
    if (user?.username) {
      const fetchCfData = async () => {
        try {
          const response = await fetch(`https://codeforces.com/api/user.info?handles=${user.username}`);
          const data = await response.json();
          if (data.status === "OK") setCfData(data.result[0]);
        } catch (error) {
          console.error("Error fetching CF data:", error);
        }
      };
      fetchCfData();
    }
  }, [user?.username]);

  useEffect(() => {
    if (user) {
      setEditForm({
        fullname: user.fullname || '',
        emailAddress: user.emailAddress || '',
        photoURL: user.photoURL || ''
      });
    }
  }, [user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && user) {
      setEditForm({
        fullname: user.fullname || '',
        emailAddress: user.emailAddress || '',
        photoURL: user.photoURL || ''
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserProfile(user.docId, editForm);
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: string | undefined) => {
    const rankColors: Record<string, string> = {
      'newbie': '#808080', 'pupil': '#008000', 'specialist': '#03A89E',
      'expert': '#0000FF', 'candidate master': '#AA00AA', 'master': '#FF8C00',
      'international master': '#FF8C00', 'grandmaster': '#FF0000',
      'international grandmaster': '#FF0000', 'legendary grandmaster': '#FF0000'
    };
    return rank ? rankColors[rank.toLowerCase()] || '#1c1e21' : '#1c1e21';
  };

  if (!user) {
    return <div className={styles.loading}>Loading Profile...</div>;
  }

  // --- NEW ELEGANT JSX STRUCTURE ---
  return (
    <div className={styles.profilePage}>
      <main className={styles.mainContent}>
        {/* Left Column: The Profile Card */}
        <div className={styles.profileCard}>
          <header className={styles.profileHeader}>
            <div className={styles.avatar}>
              <img
                src={editForm.photoURL || user.photoURL || `https://ui-avatars.com/api/?name=${user.fullname || user.username}&background=0D8ABC&color=fff&bold=true`}
                alt="Profile"
              />
            </div>
            <div className={styles.headerInfo}>
              <h1 className={styles.usernameTitle}>{user.username}</h1>
              <div className={styles.headerActions}>
                <p className={styles.fullName}>{user.fullname || 'No name provided'}</p>
                <button className={styles.editButton} onClick={handleEditToggle}>
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </header>

          <div className={styles.profileStatsBar}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{user.solvedQuestions?.length || 0}</span>
              <span className={styles.statLabel}>solved</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{user.followers?.length || 0}</span>
              <span className={styles.statLabel}>followers</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{user.following?.length || 0}</span>
              <span className={styles.statLabel}>following</span>
            </div>
          </div>

          <div className={styles.profileBody}>
            {isEditing ? (
              <div className={styles.editForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="fullname">Full Name</label>
                  <input id="fullname" type="text" name="fullname" value={editForm.fullname} onChange={handleInputChange} placeholder="Your Full Name" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="emailAddress">Email Address</label>
                  <input id="emailAddress" type="email" name="emailAddress" value={editForm.emailAddress} onChange={handleInputChange} placeholder="your.email@example.com" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="photoURL">Profile Picture URL</label>
                  <input id="photoURL" type="url" name="photoURL" value={editForm.photoURL} onChange={handleInputChange} placeholder="https://example.com/image.png" />
                </div>
                <div className={styles.formActions}>
                  <button className={styles.saveButton} onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.infoSection}>
                  <h4 className={styles.sectionTitle}>Codeforces</h4>
                  <div className={styles.infoRow}>
                    <span>Rank</span>
                    <strong style={{ color: getRankColor(cfData?.rank) }}>{cfData?.rank || 'N/A'}</strong>
                  </div>
                  <div className={styles.infoRow}>
                    <span>Current Rating</span>
                    <strong>{cfData?.rating || 'N/A'}</strong>
                  </div>
                  <div className={styles.infoRow}>
                    <span>Max Rating</span>
                    <strong>{cfData?.maxRating || 'N/A'}</strong>
                  </div>
                </div>

                <div className={styles.infoSection}>
                  <h4 className={styles.sectionTitle}>Contact Info</h4>
                  <div className={styles.infoRow}>
                    <span>Email Address</span>
                    <strong>{user.emailAddress || 'Not Provided'}</strong>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: The Illustration */}
        <div className={styles.illustrationWrapper}>
          <Image
            src="/images/profile.png" // Use the image from your uploaded file
            alt="Profile page illustration"
            width={600}
            height={600}
            className={styles.illustrationImage}
            priority
          />
        </div>
      </main>
    </div>
  );
}