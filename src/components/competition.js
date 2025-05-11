// pages/competition.js
import { useState, useEffect } from "react";
import ClaimForm from "@/components/ClaimForm"; // The form component for entering Pi Code
import Link from "next/link"; // Link component from Next.js
import styles from "@/styles/CompetitionPage.module.css"; // Optional: specific styles for competition page

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
    <div className={`${styles.container} p-6`}>
      <h1 className="text-3xl font-bold text-center text-white mb-4">
        Weekly Competition
      </h1>
      <p className="text-lg text-center text-white mb-6">
        Enter the Pi Code to claim your prize for this week's draw.
      </p>

      {drawData && (
        <ClaimForm
          drawWeek={drawData.week}
          winnerId={drawData.winnerId}
          piCode={drawData.piCode}
          expiresAt={drawData.expiresAt}
        />
      )}

      <div className="text-center mt-8">
        <Link href="/ticket-purchase/main-prize">
          <button
            className="w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-sm 
                        text-white bg-gradient-to-r from-[#1E3A8A] to-[#60A5FA] 
                        shadow-lg hover:scale-105 transition-transform duration-200"
          >
            Enter Now
          </button>
        </Link>
      </div>
    </div>
  );
}
