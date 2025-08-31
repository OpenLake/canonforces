import { useState, useEffect } from "react";
import Image from 'next/image';
import styles from "./Profile.module.css";
import useUser from "../../../hooks/use-user";
import { updateUserProfile } from "../../../services/firebase";

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
  const { user } = useUser() as { user: User };
  const [cfData, setCfData] = useState<CfData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullname: '',
    emailAddress: '',
  });

  // Image handling state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ✅ Local state for profile photo
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>("");

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
      });
      setPreviewUrl(null);
      setImageFile(null);
      setUploadError(null);

      // ✅ Sync local photo state with user
      setProfilePhotoUrl(user.photoURL || "");
    }
  }, [user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && user) {
      setEditForm({
        fullname: user.fullname || '',
        emailAddress: user.emailAddress || '',
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
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!signResponse.ok) {
        const errorText = await signResponse.text();
        throw new Error(`Failed to get upload signature: ${signResponse.status} - ${errorText}`);
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
        const errorData = await uploadResponse.text();
        throw new Error(`Failed to upload image: ${uploadResponse.status} - ${errorData}`);
      }

      const uploadData = await uploadResponse.json();
      return uploadData.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setUploadError(null);

    let photoURL = profilePhotoUrl;

    try {
      if (imageFile) {
        photoURL = await uploadImageToCloudinary(imageFile);
        // ✅ Instantly update local state
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
    return rank ? rankColors[rank.toLowerCase()] || '#1c1e21' : '#1c1e21';
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

  return (
    <div className={styles.profilePage}>
      <main className={styles.mainContent}>
        <div className={styles.profileCard}>
          <header className={styles.profileHeader}>
            <div className={styles.avatar}>
              <img
                src={
                  previewUrl ||
                  profilePhotoUrl ||
                  `https://ui-avatars.com/api/?name=${user.fullname || user.username}&background=0D8ABC&color=fff&bold=true`
                }
                alt="Profile"
              />
            </div>
            <div className={styles.headerInfo}>
              <h1 className={styles.usernameTitle}>{user.username}</h1>
              <div className={styles.headerActions}>
                <p className={styles.fullName}>{user.fullname || 'No name provided'}</p>
                <button className={styles.editButton} onClick={handleEditToggle} disabled={loading}>
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
                {uploadError && (
                  <div className={styles.errorMessage}>
                    {uploadError}
                  </div>
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
                  <label htmlFor="emailAddress">Email Address</label>
                  <input 
                    id="emailAddress" 
                    type="email" 
                    name="emailAddress" 
                    value={editForm.emailAddress} 
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
              <>
                <div className={styles.infoSection}>
                  <h4 className={styles.sectionTitle}>Codeforces</h4>
                  <div className={styles.infoRow}>
                    <span>Rank</span>
                    <strong style={{ color: getRankColor(cfData?.rank) }}>
                      {cfData?.rank || 'N/A'}
                    </strong>
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
        
        <div className={styles.illustrationWrapper}>
          <Image
            src="/images/profile2.png"
            alt="Profile page illustration"
            width={400}
            height={400}
            className={styles.illustrationImage}
            priority
          />
        </div>
      </main>
    </div>
  );
}
