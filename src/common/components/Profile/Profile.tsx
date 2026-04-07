import { useState, useEffect } from "react";
import Image from 'next/image';
import styles from "./Profile.module.css";
import useUser from "../../../hooks/use-user";
import { updateUserProfile } from "../../../services/firebase";
import { doc, getDoc, collection, query, where, limit, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { User } from "../../../types/user";
import { ContestSubmission } from "../../../types/contest-submission";
import {
  HiOutlinePuzzlePiece,
  HiOutlineCurrencyRupee,
  HiOutlineFire,
  HiOutlineUsers,
  HiArrowTrendingUp,
  HiOutlineTag,
  HiCheckCircle,
  HiOutlineChartBarSquare,
  HiOutlineChartPie,
  HiOutlineArrowTrendingUp,
  HiOutlineCalendarDays,
  HiPencilSquare,
  HiOutlineStar,
} from "react-icons/hi2";

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
  const [submissions, setSubmissions] = useState<ContestSubmission[]>([]);
  const [cfData, setCfData] = useState<CfData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullname: '',
    email: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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
            userToSet = { ...userDocSnap.data() as User, docId: userDocSnap.id };
          }
        } else {
          userToSet = loggedInUser ? { ...loggedInUser, docId: loggedInUser.docId } : null;
        }
        setUser(userToSet);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchUser();
  }, [userId, loggedInUser]);

  useEffect(() => {
    if (user?.docId) {
      const fetchSubmissions = async () => {
        try {
          const q = query(
            collection(db, "contest_submissions"),
            where("userId", "==", user.docId),
            orderBy("submittedAt", "desc"),
            limit(20)
          );

          try {
            const querySnapshot = await getDocs(q);
            const subs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContestSubmission));
            setSubmissions(subs);
          } catch (indexError: any) {
            const qFallback = query(
              collection(db, "contest_submissions"),
              where("userId", "==", user.docId),
              limit(50)
            );
            const querySnapshot = await getDocs(qFallback);
            const subs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContestSubmission));
            subs.sort((a, b) => {
              const dateA = a.submittedAt?.toDate?.() || new Date(a.submittedAt);
              const dateB = b.submittedAt?.toDate?.() || new Date(b.submittedAt);
              return dateB.getTime() - dateA.getTime();
            });
            setSubmissions(subs.slice(0, 20));
          }
        } catch (error) {
          console.error("Error fetching submissions:", error);
        }
      };
      fetchSubmissions();
    }
  }, [user?.docId]);

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
      setEditForm({ fullname: user.fullname || '', email: user.email || '' });
      setProfilePhotoUrl(user.photoURL || "");
    }
  }, [user]);

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const signResponse = await fetch('/api/sign-cloudinary-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const signData = await signResponse.json();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", signData.upload_preset);
    const uploadUrl = `https://api.cloudinary.com/v1_1/${signData.cloud_name}/image/upload`;
    const uploadResponse = await fetch(uploadUrl, { method: "POST", body: formData });
    const uploadData = await uploadResponse.json();
    return uploadData.secure_url;
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let photoURL = profilePhotoUrl;
      if (imageFile) photoURL = await uploadImageToCloudinary(imageFile);
      await updateUserProfile(user.docId, { ...editForm, photoURL });
      setIsEditing(false);
      setProfilePhotoUrl(photoURL);
    } catch (error: any) {
      setUploadError(error.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentStreak = () => {
    if (!user?.lastSolvedDate) return user?.streak || 0;
    const lastSolved = new Date(user.lastSolvedDate);
    const today = new Date();
    const diff = Math.floor((today.getTime() - lastSolved.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 1 ? 0 : (user.streak || 0);
  };

  const calculateLevel = () => {
    const solved = Object.values(user?.solvedQuestions || {}).flat().length;
    const coins = user?.coins || 0;
    return Math.max(1, Math.floor(solved / 5) + Math.floor(coins / 50));
  };

  const getCalendarData = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const activeDates = new Set<number>();

    submissions.forEach(sub => {
      const date = sub.submittedAt?.toDate?.() || new Date(sub.submittedAt);
      if (date.getFullYear() === year && date.getMonth() === month) {
        activeDates.add(date.getDate());
      }
    });

    if (user?.lastSolvedDate) {
      const date = new Date(user.lastSolvedDate);
      if (date.getFullYear() === year && date.getMonth() === month) {
        activeDates.add(date.getDate());
      }
    }

    return { month, year, firstDay, daysInMonth, activeDates };
  };

  if (!user) return <div className={styles.loading}>Loading your profile...</div>;

  const currentStreak = calculateCurrentStreak();
  const level = calculateLevel();
  const solvedCount = Object.values(user.solvedQuestions || {}).flat().length;
  const accuracy = user.totalAnswers ? Math.round(((user.correctAnswers ?? 0) / user.totalAnswers) * 100) : 0;

  const { month, year, firstDay, daysInMonth, activeDates } = getCalendarData();
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

  return (
    <div className={styles.profilePage}>
      <main className={styles.mainContent}>
        <section className={styles.topSection}>
          <div className={styles.headerRow}>
            {/* Identity & Stats Column */}
            <div className={styles.identityAndStats}>
              <div className={styles.profileCard}>
                <div className={styles.profileIdentity}>
                  <div className={styles.identityLeft}>
                    <div className={styles.avatarWrapper}>
                      <div className={styles.avatar}>
                        <img
                          src={previewUrl || profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname || user.username)}&background=f59e0b&color=fff&bold=true`}
                          alt="Profile"
                          className={styles.avatarImage}
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                      </div>
                    </div>
                    <div className={styles.userRegistry}>
                      <div className={styles.identityRow}>
                        <h1 className={styles.username}>{user.username}</h1>
                        <div className={styles.badgeArray}>
                          <span className={styles.levelBadge}>
                            <HiOutlineStar /> <span className={styles.badgeText}>LVL {level}</span>
                          </span>
                          <span className={styles.streakBadge}>
                            <HiOutlineFire /> <span className={styles.badgeText}>{currentStreak}D</span>
                          </span>
                        </div>
                      </div>
                      <p className={styles.fullname}>{user.fullname}</p>
                    </div>
                  </div>

                  {isOwnProfile && (
                    <button className={styles.editButton} onClick={handleEditToggle}>
                      <HiPencilSquare size={16} /> EDIT
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Stats Row below the profile card */}
              <div className={styles.statsRow}>
                <div className={styles.statsGrid}>
                  <div className={styles.statModule}>
                    <div className={styles.statIcon}><HiOutlinePuzzlePiece /></div>
                    <div className={styles.statValue}>{solvedCount}</div>
                    <div className={styles.statLabel}>Solved</div>
                  </div>
                  <div className={styles.statModule}>
                    <div className={styles.statIcon}><HiOutlineCurrencyRupee /></div>
                    <div className={styles.statValue}>{user.coins || 0}</div>
                    <div className={styles.statLabel}>Coins</div>
                  </div>
                  <div className={styles.statModule}>
                    <div className={styles.statIcon}><HiOutlineTag /></div>
                    <div className={styles.statValue}>{accuracy}%</div>
                    <div className={styles.statLabel}>Accuracy</div>
                  </div>
                  <div className={styles.statModule}>
                    <div className={styles.statIcon}><HiOutlineUsers /></div>
                    <div className={styles.statValue}>{user.followers?.length || 0}</div>
                    <div className={styles.statLabel}>Followers</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mascot column */}
            <div className={styles.mascotWrapper}>
              <img
                src="/images/foldHands.png"
                alt="Mascot"
                className={styles.separateAccentImg}
              />
            </div>
          </div>
        </section>

        <section className={styles.bottomSection}>

          {/* Recent Activity */}
          <div className={styles.activityPanel}>
            <h3 className={styles.moduleTitle}><HiOutlineChartBarSquare /> Recent Submissions</h3>
            <div className={styles.submissionsList}>
              {submissions.length > 0 ? (
                submissions.map((sub) => {
                  const date = sub.submittedAt?.toDate?.() || new Date(sub.submittedAt);
                  return (
                    <div key={sub.id} className={styles.submissionCard}>
                      <div className={styles.submissionHeader}>
                        <span className={styles.problemName}>{sub.problemName}</span>
                        <HiCheckCircle className={styles.statusIcon} size={18} />
                      </div>
                      <div className={styles.subMeta}>
                        <span>{sub.language}</span>
                        <span className={styles.dotSeparator}>•</span>
                        <span>
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className={styles.noActivity}>No Recent Submissions!!</p>
              )}
            </div>
          </div>

          {/* Column 2: Central Performance Stack */}
          <div className={styles.performanceStack}>

            {/* Quiz Metrics */}
            <div className={styles.gridModule}>
              <h3 className={styles.moduleTitle}><HiOutlineChartPie /> Quiz Performance</h3>
              <div className={styles.quizStatGrid}>
                <div className={styles.quizStatItem}>
                  <span className={styles.quizStatLabel}>Played</span>
                  <span className={styles.quizStatValue}>{user.quizzesPlayed || 0}</span>
                </div>
                <div className={styles.quizStatItem}>
                  <span className={styles.quizStatLabel}>Accuracy</span>
                  <span className={styles.quizStatValue}>{accuracy}%</span>
                </div>
                <div className={styles.quizStatItem}>
                  <span className={styles.quizStatLabel}>Correct</span>
                  <span className={styles.quizStatValue}>
                    {user.correctAnswers || 0} / {user.totalAnswers || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Codeforces Metrics*/}
            <div className={styles.gridModule}>
              <h3 className={styles.moduleTitle}><HiOutlineArrowTrendingUp /> Codeforces Stats</h3>
              <div className={styles.quizStatGrid}>
                <div className={styles.quizStatItem}>
                  <span className={styles.quizStatLabel}>Rank</span>
                  <span className={styles.quizStatValue} style={{ color: '#60a5fa', fontSize: '1rem' }}>
                    {cfData?.rank || 'Unrated'}
                  </span>
                </div>
                <div className={styles.quizStatItem}>
                  <span className={styles.quizStatLabel}>Current</span>
                  <span className={styles.quizStatValue}>{cfData?.rating || '--'}</span>
                </div>
                <div className={styles.quizStatItem}>
                  <span className={styles.quizStatLabel}>Max Peak</span>
                  <span className={styles.quizStatValue}>{cfData?.maxRating || '--'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Column 3: Sidebar Stack (Streak and Stats) */}
          <div className={styles.sidebarStack}>
            <div className={`${styles.gridModule} ${styles.navyCard}`}>
              <div className={styles.calendarHeader}>
                <span className={styles.monthName}>{monthName}</span>
                <span className={styles.yearName}>{year}</span>
              </div>
              <div className={styles.calendarContainer}>
                <div className={styles.calendarGrid}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <div key={`header-${idx}`} className={styles.dayLabel}>{day}</div>
                  ))}
                  {[...Array(firstDay)].map((_, i) => (
                    <div key={`pad-${i}`} className={styles.calendarDayEmpty} />
                  ))}
                  {[...Array(daysInMonth)].map((_, i) => {
                    const dayNum = i + 1;
                    const isActive = activeDates.has(dayNum);
                    return (
                      <div key={dayNum} className={`${styles.calendarDay} ${isActive ? styles.active : ''}`}>
                        {dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className={styles.tipsSection}>
                <p style={{ fontSize: '0.8rem', color: 'white', fontStyle: 'italic', marginTop: '1rem', fontWeight: 'bold' }}>
                  &quot;Consistency is the weapon of the elite.&quot;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Edit Form Modal --- */}
        {isEditing && (
          <div className={styles.editOverlay}>
            <div className={styles.editFormModal}>
              <h2 className={styles.moduleTitle}>Edit Profile</h2>
              {uploadError && <div className={styles.errorMessage}>{uploadError}</div>}

              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input type="text" name="fullname" value={editForm.fullname} onChange={handleInputChange} />
              </div>

              <div className={styles.formGroup}>
                <label>E-mail</label>
                <input type="email" name="email" value={editForm.email} onChange={handleInputChange} />
              </div>

              <div className={styles.formGroup}>
                <label>Avatar</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </div>

              <div className={styles.formActions}>
                <button className={styles.cancelBtn} onClick={handleEditToggle} disabled={loading}>Abort</button>
                <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
                  {loading ? 'UPLOADING...' : 'SAVE CHANGES'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}