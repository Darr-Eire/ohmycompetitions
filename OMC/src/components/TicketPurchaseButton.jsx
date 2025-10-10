'use client';
import { useState } from 'react';
import { usePiPurchase } from '../hooks/usePiPurchase';

export default function TicketPurchaseButton({ competitionId, tickets, pricePi }){
  const [loading,setLoading]=useState(false);
  const { purchase } = usePiPurchase();
  const memo = `competitionId:${competitionId}|tickets:${tickets}`;
  const amount = Number((tickets * pricePi).toFixed(4));

  return (
    <button
      disabled={loading}
      onClick={async ()=>{
        try {
          setLoading(true);
          await purchase({
            amount, memo,
            onApproved: ()=>{/* show "Approved — awaiting tx" */},
            onCompleted: ()=>{/* refresh tickets & toast */}
          });
        } catch(e){ console.error(e); alert('Payment failed: '+e.message); }
        finally{ setLoading(false); }
      }}
      className="btn btn-primary"
    >
      {loading ? 'Processing…' : `Buy ${tickets} ticket(s)`}
    </button>
  );
}
