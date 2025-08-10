// file: src/lib/funnel.js
import { dbConnect } from '@lib/dbConnect';
import Funnel from '@lib/models/Funnel'; // your Mongoose model, etc.

export async function getFunnelBySlug(slug) {
  await dbConnect();
  return Funnel.findOne({ slug }).lean();
}
