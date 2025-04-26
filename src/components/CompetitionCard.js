// src/components/CompetitionCard.js
export default function CompetitionCard({
  title = "Everyday Pioneer",
  prize = "1,000 PI Giveaways",
  fee = "0.314 PI",
  onEnter = () => alert("Entered!"),
}) {
  return (
    <div className="competition-card">
      <h2 className="comp-title">{title}</h2>
      <p className="comp-prize">{prize}</p>
      <p className="comp-fee">
        Entry fee: <strong>{fee}</strong>
      </p>
      <button className="comp-button" onClick={onEnter}>
        Enter Now
      </button>
    </div>
  );
}
