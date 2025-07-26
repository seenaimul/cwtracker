import React, { useState, useRef, useEffect } from 'react';
import { useAuth, useUser } from '../App';
import { useNavigate, Link } from 'react-router-dom';
import { UserIcon, ChevronLeftIcon } from '../components/Icons';
import { auth, storage, db } from '../firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';

interface ProfileItemProps {
  children: React.ReactNode;
}

const ProfileItem = ({ children }: ProfileItemProps) => (
  <div className="bg-light-surface dark:bg-brand-secondary-dark p-4 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-brand-accent/50 transition-colors">
    <span className="text-light-text dark:text-brand-light">{children}</span>
    <svg xmlns="http://www.w3.org/2000/svg" className="text-light-text-secondary dark:text-brand-accent-light" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 12 9 6"></polyline></svg>
  </div>
);

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { name, setName, profilePic, setProfilePic } = useUser();
  const [isEditingName, setIsEditingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser?.displayName) {
      setName(currentUser.displayName);
    }
    if (currentUser?.photoURL) {
      setProfilePic(currentUser.photoURL);
    }
  }, [currentUser, setName, setProfilePic]);

  const saveToFirestore = async (name?: string, photoURL?: string) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(userRef, {
        ...(name && { name }),
        ...(photoURL !== undefined && { photoURL }),
      }, { merge: true });
    } catch (error) {
      console.error("Error saving to Firestore:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleNameUpdate = async () => {
    if (currentUser && name.trim() !== '' && name.trim() !== currentUser.displayName) {
      try {
        await updateProfile(currentUser, { displayName: name.trim() });
        await saveToFirestore(name.trim(), undefined);
      } catch (error) {
        console.error("Error updating name:", error);
        setName(currentUser.displayName || '');
      }
    }
    setIsEditingName(false);
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && currentUser) {
      const file = e.target.files[0];
      const storageRef = ref(storage, `profile-pics/${currentUser.uid}`);
      setUploading(true);
      try {
        // Compress image before upload
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 300,
          useWebWorker: true
        });

        await uploadBytes(storageRef, compressedFile);
        const photoURL = await getDownloadURL(storageRef);
        await updateProfile(currentUser, { photoURL });
        setProfilePic(photoURL);
        await saveToFirestore(undefined, photoURL);
      } catch (error) {
        console.error("Error uploading profile picture: ", error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemoveProfilePic = async () => {
    if (!currentUser) return;

    const storageRef = ref(storage, `profile-pics/${currentUser.uid}`);
    setUploading(true);
    try {
      await deleteObject(storageRef);
    } catch (err) {
      console.warn("Image might not exist in storage:", err);
    }

    try {
      await updateProfile(currentUser, { photoURL: null });
      setProfilePic('');
      await saveToFirestore(undefined, '');
    } catch (error) {
      console.error("Error removing profile picture: ", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center mb-4">
        <button onClick={() => navigate(-1)} className="p-2">
          <ChevronLeftIcon />
        </button>
        <h1 className="text-xl font-bold text-light-text dark:text-white text-center flex-grow">Profile</h1>
      </header>

      <div className="flex flex-col items-center space-y-2">
        <input type="file" ref={fileInputRef} onChange={handleProfilePicChange} accept="image/*" className="hidden" />
        <div className="relative group">
          <button onClick={() => fileInputRef.current?.click()} className="w-24 h-24 bg-light-accent dark:bg-brand-accent rounded-full flex items-center justify-center overflow-hidden">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <UserIcon size={48} className="text-white" />
            )}
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-semibold">{uploading ? "..." : "Edit"}</span>
            </div>
          </button>
          {profilePic && (
            <button onClick={handleRemoveProfilePic} className="absolute top-0 right-0 p-1 bg-red-600 rounded-full text-white text-xs hover:bg-red-700 transition-all">
              ✕
            </button>
          )}
        </div>

        {isEditingName ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameUpdate}
            onKeyDown={(e) => { if (e.key === 'Enter') handleNameUpdate(); }}
            autoFocus
            className="text-2xl font-semibold text-light-text dark:text-white bg-transparent border-b-2 border-brand-accent text-center outline-none"
          />
        ) : (
          <h2 onClick={() => setIsEditingName(true)} className="text-2xl font-semibold text-light-text dark:text-white cursor-pointer">
            {name || "Anonymous User"}
          </h2>
        )}

        <p className="text-light-text-secondary dark:text-brand-accent-light">
          {currentUser?.email || "No email"}
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-light-text-secondary dark:text-brand-accent-light font-semibold px-2">Settings</h3>
        <Link to="/calendar"><ProfileItem>Calendar</ProfileItem></Link>
        <Link to="/grades"><ProfileItem>Grade Tracker</ProfileItem></Link>
        <Link to="/degree-calculator"><ProfileItem>University Degree Calculator</ProfileItem></Link>
        <ProfileItem>App feedback</ProfileItem>
      </div>

      <div className="pt-4">
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-lg bg-rose-500 hover:bg-rose-600 dark:bg-rose-600/80 text-white font-semibold"
        >
          Logout
        </button>
      </div>
    </div>
  );
};
