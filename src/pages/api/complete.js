export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const {paymentId,txid}=req.body||{};
  if(!paymentId||!txid) return res.status(400).json({error:'paymentId and txid required'});
  const apiKey=process.env.PI_API_KEY_TESTNET||process.env.PI_API_KEY; if(!apiKey) return res.status(500).json({error:'Pi API key not configured'});
  try{
    const r=await fetch(`https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/complete`,{
      method:'POST',headers:{Authorization:`Key ${apiKey}`,Accept:'application/json','Content-Type':'application/json'},
      body:JSON.stringify({txid})
    });
    const text=await r.text(); const data=text?JSON.parse(text):null;
    if(!r.ok) return res.status(r.status).json({error:data?.error||data?.message||text||'complete failed'});
    return res.status(200).json({ok:true,payment:data});
  }catch(e){ return res.status(500).json({error:'Server error',detail:e?.message||String(e)}); }
}
