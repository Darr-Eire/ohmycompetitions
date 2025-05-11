// pages/competition.js

import { useState, useEffect } from "react";
import ClaimForm from "@/components/ClaimForm"; // The form component for entering Pi Code
import styles from "@/styles/CompetitionPage.module.css"; // Optional styling

export default function CompetitionPage() {
  const [drawData, setDrawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current draw data
  useEffect(() => {
    const fetchDrawData = async () => {
      try {
        const response = await fetch("/api/draw/current"); // Backend API to fetch current draw
        const data = await response.json();
        if (response.ok) {
          setDrawData(data);
        } else {
          setError(data.error || "Something went wrong.");
        }
      } catch (error) {
        setError("Failed to fetch draw data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDrawData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.container}>
      <h1>Weekly Competition</h1>
      <p>Enter the Pi Code to claim your prize for this week's draw.</p>

      {drawData && (
        <ClaimForm
          drawWeek={drawData.week}
          winnerId={drawData.winnerId}
          piCode={drawData.piCode}
          expiresAt={drawData.expiresAt}
        />
      )}
    </div>
  );
}
