import React, { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import { getUserProfile, updateUserProfile } from "../services/profileService"; // Import the service file
import ConnectFitbit from "./ConnectFitbit";

export default function Profile({ userEmail, onLogout, userId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    role: "",
    email: userEmail,
    phone: "",
    address: "",
    profileImage: "",
  });

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setProfileData((prevData) => ({
        ...prevData,
        profileImage: reader.result,
      }));
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleImageButtonClick = () => {
    document.getElementById("fileInput").click();
  };

  const handleSaveClick = async () => {
    if (isEditing) {
      try {
        const response = await updateUserProfile(profileData);
        if (response) {
          alert("User profile updated successfully");
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      onLogout();
    }
    setIsEditing(!isEditing);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserProfile(userEmail);
        if (data) {
          setProfileData((prevData) => ({
            ...prevData,
            name: data.name,
            phone: data.phone,
            role: data.role,
            address: data.address,
            profileImage: data.profilePhoto,
          }));
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [userEmail]);

  return (
    <>
      <div className={styles.sidebar}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20px"
          height="20px"
          viewBox="0 0 24 24"
          className={styles.editIcon}
          onClick={handleEditClick}
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M20.71 7.04l-4.75-4.75a.996.996 0 0 0-1.41 0L2.29 14.29a1 1 0 0 0-.29.7V19a2 2 0 0 0 2 2h4.01c.26 0 .52-.1.71-.29l11.71-11.71a.996.996 0 0 0 0-1.41zm-4.32-.38L17 5.01l1.62 1.62-1.47 1.47-1.62-1.62zM7 17v-2.02l7.07-7.07 2.02 2.02L9.02 17H7z" />
        </svg>

        <div className={styles.profileSection}>
          <div className={styles.profilePhoto}>
            <img src={profileData.profileImage} alt="Profile" />
          </div>
          {isEditing && (
            <>
              <button
                className={styles.plusIcon}
                onClick={handleImageButtonClick}
              >
                +
              </button>
              <input
                type="file"
                id="fileInput"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </>
          )}
          <div className={styles.userInfo}>
            {isEditing ? (
              <>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  className={styles.inputField}
                />
                <input
                  type="text"
                  name="role"
                  value={profileData.role}
                  onChange={(e) =>
                    setProfileData({ ...profileData, role: e.target.value })
                  }
                  className={styles.inputField}
                />
                <input
                  type="text"
                  name="phone"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  className={styles.inputField}
                />
                <input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({ ...profileData, address: e.target.value })
                  }
                  className={styles.inputField}
                />
              </>
            ) : (
              <>
                <h2>{profileData.name}</h2>
                <div className={styles.details}>
                  <p>{profileData.role}</p>
                  <p>{profileData.email}</p>
                  <p>{profileData.phone}</p>
                  <p>{profileData.address}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <button className={styles.logoutButton} onClick={handleSaveClick}>
          {isEditing ? "Save" : "Logout"}
        </button>
        <ConnectFitbit userId={userId} />
      </div>
    </>
  );
}
