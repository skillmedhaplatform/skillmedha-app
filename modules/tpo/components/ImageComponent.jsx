import Image from 'next/image'
import React from 'react'
import profile from '@/public/tpo/profilrImage.svg'
import profiles from './styles/profileImage.module.scss'

const avatarColors = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e",
  "#10b981", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#f43f5e"
];

const ImageComponent = ({ profileImage, firstName, lastName, fullName }) => {
  const getInitials = (fName = "", lName = "") => {
    const init = ((fName?.[0] || "") + (lName?.[0] || "")).toUpperCase();
    return init || "ST";
  };

  const initial = getInitials(firstName, lastName);
  const colorIndex = fullName && fullName !== "N/A" ? fullName.charCodeAt(0) % avatarColors.length : 0;
  const avatarColor = avatarColors[colorIndex];

  return (
    <div className={profiles.image} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {profileImage ? (
        <img 
          src={profileImage} 
          alt={fullName || "Profile Image"} 
          style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover' }} 
        />
      ) : (
        <div style={{
          width: '90px', 
          height: '90px', 
          borderRadius: '50%', 
          backgroundColor: avatarColor,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontSize: '32px',
          fontWeight: '700'
        }}>
          {initial}
        </div>
      )}
    </div>
  )
}

export default ImageComponent