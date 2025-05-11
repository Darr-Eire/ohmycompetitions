// pages/draw/[week].js

import { useEffect, useState } from "react";
import ClaimForm from "@/components/ClaimForm";

export default function DrawPage({ drawWeek }) {
  const [drawData, setDrawData] = useState(null);

  useEffect(() => {
    const fetchDrawData = async () => {
      const response = await fetch(`/api/draw/${drawWeek}`);
      const data = await response.json();
      setDrawData(data);
    };

    fetchDrawData();
  }, [drawWeek]);

  if (!drawData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Weekly Draw: {drawWeek}</h1>
      <ClaimForm
        drawWeek={drawWeek}
        winnerId={drawData.winnerId}
        piCode={drawData.piCode}
        expiresAt={drawData.expiresAt}
      />
    </div>
  );
}

export async function getServerSideProps(context) {
  const { week } = context.params;
  return { props: { drawWeek: week } };
}
