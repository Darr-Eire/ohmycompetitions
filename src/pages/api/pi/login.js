// src/pages/api/pi/login.js
import axios from "axios";
import jwt from "jsonwebtoken";
import { dbConnect } from '../../../lib/dbConnect';
import User from '../../../models/User';
import { fetchMe } from '../../../../server/piApi';



export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { accessToken } = req.body || {};
  if (!accessToken) {
    return res.status(400).json({ ok: false, error: "Missing access token" });
  }

  const tokenPreview = `${accessToken.slice(0, 4)}...${accessToken.slice(-4)}`;

  try {
    // 1) Verify token with Pi
    console.log("🟡 [/api/pi/login] Verifying token with Pi", {
      tokenLen: accessToken.length,
      tokenPreview,
      sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX,
    });

    const meResp = await axios.get("https://api.minepi.com/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 12000,
    });

    const me = meResp.data;
    console.log("🟢 Pi /v2/me OK", {
      status: meResp.status,
      uid: me?.uid,
      username: me?.username,
      scopes: me?.credentials?.scopes,
      roles: me?.roles,
    });

    // 2) Upsert user
    await dbConnect();
    const doc = await User.findOneAndUpdate(
      { piUid: me.uid },
      {
        username: me.username,
        roles: me.roles || [],
        scopes: me.credentials?.scopes || [],
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Make plain object for response
    const user = doc.toObject ? doc.toObject() : doc;

    // 3) Create session JWT (simple example)
    const payload = { uid: me.uid, id: user._id.toString(), uname: me.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "dev-secret", {
      expiresIn: "7d",
    });

    // Optionally set httpOnly cookie instead of returning token in JSON
    res.setHeader("Set-Cookie", [
      `omc_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
    ]);

    return res.status(200).json({ ok: true, token, me: user });
  } catch (err) {
    const status = err.response?.status;
    const data = err.response?.data;
    console.error("🔴 Pi login failed", {
      status,
      data,
      message: err.message,
      sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX,
      tokenPreview,
    });
    return res.status(401).json({ ok: false, error: "Pi verification failed" });
  }
}
