import { useState, useEffect } from "react";
import Image from 'next/image';
import styles from "./Profile.module.css";
import useUser from "../../../hooks/use-user";
import { updateUserProfile } from "../../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { User } from "../../../types/user";

type ProfileProps = {
  userId?: string;
};

type CfData = {
  handle: string;
  rank?: string;
  rating?: number;
  maxRating?: number;
};

export default function Profile({ userId }: ProfileProps) {
  const { user: loggedInUser } = useUser() as { user: User | undefined };
  
  const [user, setUser] = useState<User | null>(null);
  const [cfData, setCfData] = useState<CfData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullname: '',
    email: '',
  });

  // Image handling state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Local state for profile photo
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>("");

  const isOwnProfile = !userId || userId === loggedInUser?.docId;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let userToSet: User | null = null;
        if (userId) {
          const userDocRef = doc(db, "users", userId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            userToSet = userDocSnap.data() as User;
          } else {
            console.warn("User not found");
          }
        } else {
          userToSet = loggedInUser || null;
        }
        setUser(userToSet);

      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchUser();
  }, [userId, loggedInUser]);

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
        email: user.email || '',
      });
      setPreviewUrl(null);
      setImageFile(null);
      setUploadError(null);
      setProfilePhotoUrl(user.photoURL || "");
    }
  }, [user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && user) {
      setEditForm({
        fullname: user.fullname || '',
        email: user.email || '',
      });
      setImageFile(null);
      setPreviewUrl(null);
      setUploadError(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        return;
      }

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Please select a valid image file (JPEG, PNG, or WebP)');
        return;
      }

      setImageFile(file);
      setUploadError(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    try {
      const signResponse = await fetch('/api/sign-cloudinary-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!signResponse.ok) {
        throw new Error('Failed to get upload signature');
      }

      const signData = await signResponse.json();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', signData.upload_preset);
      formData.append('api_key', signData.api_key);
      formData.append('signature', signData.signature);
      formData.append('timestamp', signData.timestamp.toString());

      const uploadUrl = `https://api.cloudinary.com/v1_1/${signData.cloud_name}/image/upload`;
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
      const uploadData = await uploadResponse.json();
      return uploadData.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!user) {
      setUploadError("Cannot update profile. User data is not available.");
      return;
    }

    setLoading(true);
    setUploadError(null);

    let photoURL = profilePhotoUrl;

    try {
      if (imageFile) {
        photoURL = await uploadImageToCloudinary(imageFile);
        setProfilePhotoUrl(photoURL);
      }

      const updatedProfile = {
        ...editForm,
        photoURL: photoURL,
      };

      await updateUserProfile(user.docId, updatedProfile);

      setIsEditing(false);
      setImageFile(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } catch (error: any) {
      setUploadError(error.message || "Failed to update profile. Please try again.");
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

  const getRankGradient = (rank: string | undefined) => {
    const rankGradients: Record<string, string> = {
      'newbie': 'linear-gradient(135deg, #808080 0%, #a0a0a0 100%)',
      'pupil': 'linear-gradient(135deg, #008000 0%, #00c000 100%)',
      'specialist': 'linear-gradient(135deg, #03A89E 0%, #00d4ff 100%)',
      'expert': 'linear-gradient(135deg, #0000FF 0%, #4a86e8 100%)',
      'candidate master': 'linear-gradient(135deg, #AA00AA 0%, #ff66ff 100%)',
      'master': 'linear-gradient(135deg, #FF8C00 0%, #ffb366 100%)',
      'international master': 'linear-gradient(135deg, #FF8C00 0%, #ffb366 100%)',
      'grandmaster': 'linear-gradient(135deg, #FF0000 0%, #ff6666 100%)',
      'international grandmaster': 'linear-gradient(135deg, #FF0000 0%, #ff6666 100%)',
      'legendary grandmaster': 'linear-gradient(135deg, #FF0000 0%, #cc0000 100%)'
    };
    return rank ? rankGradients[rank.toLowerCase()] || 'linear-gradient(135deg, #1c1e21 0%, #2d3748 100%)' : 'linear-gradient(135deg, #1c1e21 0%, #2d3748 100%)';
  };

  // Fixed Streak Logic
  const calculateCurrentStreak = () => {
    if (!user?.lastSolvedDate) return user?.streak || 0;
    
    const lastSolved = new Date(user.lastSolvedDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset streak if last solved was more than 2 days ago
    const daysSinceLastSolved = Math.floor((today.getTime() - lastSolved.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastSolved > 1) {
      return 0; // Streak broken
    }
    
    // If last solved was today or yesterday, maintain streak
    const isToday = lastSolved.toDateString() === today.toDateString();
    const isYesterday = lastSolved.toDateString() === yesterday.toDateString();
    
    if (isToday || isYesterday) {
      return user.streak || 0;
    }
    
    return 0;
  };

  // Calculate level based on solved problems and coins
  const calculateLevel = () => {
    const solved = Object.values(user?.solvedQuestions || {}).flat().length;
    const coins = user?.coins || 0;
    const baseLevel = Math.floor(solved / 5) + Math.floor(coins / 50);
    return Math.max(1, baseLevel);
  };

  // Generate streak calendar data
  const generateStreakCalendar = () => {
    const streak = calculateCurrentStreak();
    const calendarDays = [];
    const today = new Date();
    
    // Generate last 7 days including today
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const isActive = i >= (6 - Math.min(streak - 1, 6));
      
      calendarDays.push({
        date: date.getDate(),
        month: date.getMonth(),
        isActive: isActive && streak > 0
      });
    }
    
    return calendarDays;
  };

  // Check if streak is in danger (last solved was yesterday)
  const isStreakInDanger = () => {
    if (!user?.lastSolvedDate) return false;
    
    const lastSolved = new Date(user.lastSolvedDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return lastSolved.toDateString() === yesterday.toDateString();
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!user) {
    return <div className={styles.loading}>Loading Profile...</div>;
  }

  const currentStreak = calculateCurrentStreak();
  const streakCalendar = generateStreakCalendar();
  const level = calculateLevel();
  const solvedCount = Object.values(user.solvedQuestions || {}).flat().length;
  const accuracy = user.totalAnswers ? Math.round((user.correctAnswers / user.totalAnswers) * 100) : 0;
  const streakDanger = isStreakInDanger();

  return (
    <div className={styles.profilePage}>
      <main className={styles.mainContent}>
        {/* Left Column - Profile Card */}
        <div className={styles.leftColumn}>
          {/* Profile Header with Banner */}
          <div className={styles.profileHeader}>
            <div className={styles.banner}></div>
            <div className={styles.headerContent}>
              <div className={styles.avatarContainer}>
                <div className={styles.avatar}>
                  <Image
                    src={
                      previewUrl ||
                      profilePhotoUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.fullname || user.username
                      )}&background=0D8ABC&color=fff&bold=true`
                    }
                    alt="Profile"
                    width={120}
                    height={120}
                    className={styles.avatarImage}
                  />
                </div>
                {isOwnProfile && (
                  <button className={styles.editProfileButton} onClick={handleEditToggle}>
                    Edit Profile
                  </button>
                )}
              </div>
              
              <div className={styles.userInfo}>
                <div className={styles.usernameSection}>
                  <h1 className={styles.username}>{user.username}</h1>
                  <div className={styles.badges}>
                    <span className={styles.levelBadge}>Level {level}</span>
                    <span className={`${styles.streakBadge} ${streakDanger ? styles.streakDanger : ''}`}>
                      🔥 {currentStreak} days {streakDanger && '⚠️'}
                    </span>
                  </div>
                </div>
                <p className={styles.tagline}>{user.fullname || 'Codeforces Enthusiast'}</p>
                {streakDanger && (
                  <div className={styles.streakWarning}>
                    Solve a problem today to maintain your streak!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🧠</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{solvedCount}</div>
                <div className={styles.statLabel}>Solved</div>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🪙</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{user.coins || 0}</div>
                <div className={styles.statLabel}>Coins</div>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${streakDanger ? styles.streakDangerIcon : ''}`}>🔥</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{currentStreak}</div>
                <div className={styles.statLabel}>Streak</div>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{user.followers?.length || 0}</div>
                <div className={styles.statLabel}>Followers</div>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>↗️</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{user.following?.length || 0}</div>
                <div className={styles.statLabel}>Following</div>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🎯</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{accuracy}%</div>
                <div className={styles.statLabel}>Accuracy</div>
              </div>
            </div>
          </div>

          {/* Codeforces Integration */}
          {cfData && (
            <div className={styles.cfSection}>
              <h3 className={styles.sectionTitle}>Codeforces Stats</h3>
              <div 
                className={styles.cfRankCard}
                style={{ background: getRankGradient(cfData.rank) }}
              >
                <div className={styles.cfRankInfo}>
                  <div className={styles.cfHandle}>@{cfData.handle}</div>
                  <div className={styles.cfRank}>{cfData.rank || 'Unrated'}</div>
                </div>
                <div className={styles.cfRatingInfo}>
                  <div className={styles.ratingItem}>
                    <span>Current Rating</span>
                    <strong>{cfData.rating || 'N/A'}</strong>
                  </div>
                  <div className={styles.ratingItem}>
                    <span>Max Rating</span>
                    <strong>{cfData.maxRating || 'N/A'}</strong>
                  </div>
                </div>
              </div>
              
              {/* Rating Progress Bar */}
              <div className={styles.ratingProgress}>
                <div className={styles.progressLabel}>
                  <span>Progress to next rank</span>
                  <span>65%</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: '65%', background: getRankColor(cfData.rank) }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Form */}
          {isEditing && (
            <div className={styles.editForm}>
              <h3 className={styles.sectionTitle}>Edit Profile</h3>
              {uploadError && (
                <div className={styles.errorMessage}>{uploadError}</div>
              )}
              
              <div className={styles.formGroup}>
                <label htmlFor="fullname">Full Name</label>
                <input 
                  id="fullname" 
                  type="text" 
                  name="fullname" 
                  value={editForm.fullname} 
                  onChange={handleInputChange} 
                  placeholder="Your Full Name" 
                  disabled={loading} 
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <input 
                  id="email" 
                  type="email" 
                  name="email" 
                  value={editForm.email} 
                  onChange={handleInputChange} 
                  placeholder="your.email@example.com" 
                  disabled={loading} 
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="photoFile">Change Profile Picture</label>
                <input 
                  id="photoFile" 
                  type="file" 
                  name="photoFile" 
                  accept="image/png,image/jpeg,image/jpg,image/webp" 
                  onChange={handleImageChange} 
                  className={styles.fileInput} 
                  disabled={loading} 
                />
                <small>Max file size: 5MB. Supported formats: JPEG, PNG, WebP</small>
              </div>

              <div className={styles.formActions}>
                <button className={styles.cancelButton} onClick={handleEditToggle} disabled={loading}>
                  Cancel
                </button>
                <button className={styles.saveButton} onClick={handleSave} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Activity Panel */}
        <div className={styles.rightColumn}>
          <div className={styles.activityPanel}>
            <h3 className={styles.sectionTitle}>Recent Activity</h3>
            
            {/* Streak Calendar */}
            <div className={styles.activitySection}>
              <h4>🔥 Current Streak - {currentStreak} days</h4>
              <div className={styles.streakCalendar}>
                <div className={styles.calendarGrid}>
                  {streakCalendar.map((day, index) => (
                    <div 
                      key={index} 
                      className={`${styles.calendarDay} ${day.isActive ? styles.active : ''}`}
                      title={`${day.date}/${day.month + 1}`}
                    >
                      {day.date}
                    </div>
                  ))}
                </div>
                {streakDanger && (
                  <div className={styles.streakWarningText}>
                    ⚠️ Solve a problem today to maintain your {currentStreak}-day streak!
                  </div>
                )}
              </div>
            </div>

            {/* Recent Submissions */}
            <div className={styles.activitySection}>
              <h4>📈 Recent Submissions</h4>
              <div className={styles.submissionsList}>
                {solvedCount > 0 ? (
                  <div className={styles.submissionItem}>
                    <div className={styles.submissionInfo}>
                      <span className={styles.problemCount}>Solved {solvedCount} problems</span>
                      <span className={styles.lastActive}>
                        Last active: {user.lastSolvedDate ? new Date(user.lastSolvedDate).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                    <div className={styles.difficultyBreakdown}>
                      {Object.entries(user.solvedQuestions || {}).map(([difficulty, problems]) => (
                        <span key={difficulty} className={styles.difficultyTag}>
                          {difficulty}: {problems.length}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className={styles.noActivity}>No submissions yet. Start solving problems!</p>
                )}
              </div>
            </div>

            {/* Quiz Performance */}
            <div className={styles.activitySection}>
              <h4>🎯 Quiz Performance</h4>
              <div className={styles.quizStats}>
                <div className={styles.quizStat}>
                  <span>Played</span>
                  <strong>{user.quizzesPlayed || 0}</strong>
                </div>
                <div className={styles.quizStat}>
                  <span>Accuracy</span>
                  <strong>{accuracy}%</strong>
                </div>
                <div className={styles.quizStat}>
                  <span>Correct</span>
                  <strong>{user.correctAnswers || 0}/{user.totalAnswers || 0}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}