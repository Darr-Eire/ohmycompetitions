// file: src/pages/api/funnel/stage/[stage].js
import { lobby } from '../../../../lib/funnelLobby';

export default async function handler(req, res) {
  const stage = parseInt(req.query.stage, 10);
  if (![1,2].includes(stage)) {
    return res.status(200).json({ filling: [], live: [] });
  }

  const data = lobby.getStageFeed(stage);
  return res.status(200).json(data);
}
