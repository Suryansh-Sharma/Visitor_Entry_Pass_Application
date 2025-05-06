import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import "../css/ProfileCard.css"
function ProfileCard({
  id,
  name,
  time,
  host,
  image,
  visitorContact,
  status,
  reason,
}) {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState(null);

  // Function to handle navigation
  const handleNavigate = () => {
    navigate("/visitor-profile/" + id);
  };

  // Function to format the date
  const formatDate = (isoDateStr) => {
    if (!isoDateStr) {
      return "";
    }
    const date = new Date(isoDateStr);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(date);
  };

  // Fetch and store image in sessionStorage
  const fetchImage = async () => {
    const cachedImage = sessionStorage.getItem(image);

    if (cachedImage) {
      // If image is cached in sessionStorage, use it directly
      setImageUrl(cachedImage);
    } else {
      // If image is not cached, fetch it from the server
      const imageUrl = `http://localhost:8080/api/v1/file/image-by-name/${image}`;

      // Fetch image as a Blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Convert the Blob to a Base64 string
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;

        // Cache the Base64 image string in sessionStorage
        sessionStorage.setItem(image, base64Image);

        // Update the imageUrl state with the Base64 string
        setImageUrl(base64Image);
      };

      reader.readAsDataURL(blob);
    }
  };

  useEffect(() => {
    fetchImage();
  }, [image]);

  return (
    <div
      className="profile-card"
      onClick={handleNavigate}
      style={{ cursor: "pointer" }}
    >
      {/* Card image and overlay */}
      <div className="image-container">
        {image ? (
          <img
            className="card-image"
            src={imageUrl}
            alt="Profile"
          />
        ) : (
          <div className="image-placeholder">
            <span className="loading-text">Loading...</span>
          </div>
        )}
        {/* Overlay */}
        <div className="overlay"></div>
        {/* Name */}
        <div className="name-container">
          <h2 className="name-text">{name}</h2>
        </div>
      </div>

      {/* Card content */}
      <div className="card-content">
        <p className="info">
          <span className="info-label">Visitor Contact:</span> {visitorContact}
        </p>
        <p className="info">
          <span className="info-label">Visited On:</span> {formatDate(time)}
        </p>
        <p className="info">
          <span className="info-label">Host:</span> {host}
        </p>
        <p className="info">
          <span className="info-label">Reason:</span> {reason.substring(0, 10)}
        </p>
        <p className="info">
          <span className="info-label">Status:</span> {status}
        </p>
      </div>
    </div>
  );
}

export default ProfileCard;
