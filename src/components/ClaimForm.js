// components/ClaimForm.js

import { useState, useEffect } from "react";

export default function ClaimForm({ drawWeek, winnerId, piCode, expiresAt }) {
  const [inputCode, setInputCode] = useState("");
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null); // New state for notifications

  // Start countdown timer
  useEffect(() => {
    const expirationTime = new Date(expiresAt).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const remainingTime = expirationTime - now;
      if (remainingTime <= 0) {
        clearInterval(interval);
      }
      setTimer(remainingTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotification(null); // Reset notification on form submit

    const response = await fetch("/api/draw/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: winnerId,
        inputCode: inputCode.trim(),
        drawWeek,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(true);
      setNotification({ type: "success", message: "✅ Prize claimed successfully!" });
    } else {
      setError(data.error);
      setNotification({ type: "error", message: data.error || "An error occurred." });
    }

    setLoading(false);
  };

  return (
    <div>
      <div>
        <p>Pi Code: {piCode}</p>
        <p>Time remaining: {formatTime(timer)}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <label>
          Enter your Pi Code:
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Enter Pi Code"
            required
          />
        </label>
        <button type="submit" disabled={timer <= 0 || loading}>
          {loading ? "Claiming..." : "Claim Prize"}
        </button>
      </form>

      {/* Show Notification */}
      {notification && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: notification.type === "success" ? "green" : "red",
            color: "white",
            borderRadius: "5px",
          }}
        >
          {notification.message}
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>✅ Prize claimed successfully!</p>}
    </div>
  );
}
