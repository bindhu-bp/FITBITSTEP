import React, { useState, useEffect } from "react";
import styles from "./Profile.module.css";
import { getUserProfile, updateUserProfile } from "../services/profileService";

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
  const [menuOpen, setMenuOpen] = useState(false);

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
    }
    setIsEditing(!isEditing);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuOption = (option) => {
    if (option === "Edit") {
      setIsEditing(true);
    } else if (option === "Logout") {
      onLogout();
    }
    setMenuOpen(false);
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
        <div className={styles.hamburgerMenu} onClick={toggleMenu}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
          >
            <path
              d="M3 6h18M3 12h18M3 18h18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>

        {menuOpen && (
          <div className={styles.menuOptions}>
            <button
              onClick={() => handleMenuOption("Edit")}
              className={styles.menuButton}
            >
              Edit Profile
            </button>
            <button
              onClick={() => handleMenuOption("Logout")}
              className={styles.menuButton}
            >
              Logout
            </button>
          </div>
        )}

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
                <div className={styles.inputContainer}>
                  <label className={styles.inputLabel} htmlFor="name">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className={styles.inputField}
                  />
                </div>
                <div className={styles.inputContainer}>
                  <label className={styles.inputLabel} htmlFor="role">
                    Role
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={profileData.role}
                    onChange={(e) =>
                      setProfileData({ ...profileData, role: e.target.value })
                    }
                    className={styles.inputField}
                  />
                </div>
                <div className={styles.inputContainer}>
                  <label className={styles.inputLabel} htmlFor="phone">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    className={styles.inputField}
                  />
                </div>
                <div className={styles.inputContainer}>
                  <label className={styles.inputLabel} htmlFor="address">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        address: e.target.value,
                      })
                    }
                    className={styles.inputField}
                  />
                </div>
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

        {isEditing && (
          <button className={styles.saveButton} onClick={handleSaveClick}>
            Save
          </button>
        )}
      </div>
    </>
  );
}
