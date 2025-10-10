import 'dotenv/config';
import cron from 'node-cron';
import dbConnect from '../src/lib/dbConnect.js';
import FunnelCompetition from '../src/models/FunnelCompetition.js';
import { ensureOpenStage1, maybeGoLive, promoteFromQueue } from '../src/lib/funnelService.js';

const MIN_OPEN_STAGE1 = Number(process.env.MIN_OPEN_STAGE1 || 2);
const DEFAULT_CAPACITY = Number(process.env.FUNNEL_CAPACITY || 25);
const DEFAULT_ADVANCING = Number(process.env.FUNNEL_ADVANCING || 5);
const STAGES = [2, 3, 4, 5]; // stages to auto-create from queue

async function flipFullStage1ToLive() {
  const full = await FunnelCompetition.find({
    status: 'filling',
    stage: 1,
    $expr: { $gte: ['$entrantsCount', '$capacity'] },
  });
  for (const comp of full) {
    const flipped = await maybeGoLive(comp);
    if (flipped) console.log('[worker] Stage1 LIVE:', comp.slug);
  }
}

async function promoteQueues() {
  for (const toStage of STAGES) {
    const comp = await promoteFromQueue(toStage, {
      capacity: DEFAULT_CAPACITY,
      advancing: DEFAULT_ADVANCING,
    });
    if (comp) console.log(`[worker] Created Stage${toStage} from queue:`, comp.slug);
  }
}

async function tick() {
  await dbConnect();
  await ensureOpenStage1(MIN_OPEN_STAGE1, {
    capacity: DEFAULT_CAPACITY,
    advancing: DEFAULT_ADVANCING,
  });
  await flipFullStage1ToLive();
  await promoteQueues();
}

async function main() {
  await dbConnect();
  console.log('[worker] Funnel worker started');

  // run immediately, then every 30s
  await tick();
  cron.schedule('*/30 * * * * *', tick);
}

main().catch(err => {
  console.error('[worker] Fatal', err);
  process.exit(1);
});
