// file: src/pages/api/funnel/stages.ts
import type { NextApiRequest, NextApiResponse } from 'next';

// Reuse the existing JS handler at /api/funnel/stage/stages
// Next transpiles both, so a relative import is fine.
const jsHandler = require('./stage/stages'); // CommonJS import to avoid TS/ESM interop quirks

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return jsHandler(req, res);
}
