/* --- ProfileEditor.jsx --- */
'use client';
import React, { useRef, useState } from 'react';

export default function ProfileEditor({ user, onSaved }) {
  const [displayName, setDisplayName] = useState(user?.displayName || user?.username || '');
  const [showUsername, setShowUsername] = useState(!!user?.showUsername);
  const [avatarUrl, setAvatarUrl] = useState(user?.profileImage || '');
  const [bannerUrl, setBannerUrl] = useState(user?.bannerImage || '');
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  async function upload(file) {
    // swap to your uploader if needed (S3/Cloudinary/etc.)
    const body = new FormData();
    body.append('file', file);
    const res = await fetch('/api/user/upload', { method: 'POST', body });
    if (!res.ok) throw new Error('Upload failed');
    const json = await res.json();
    return json.url; // expect { url }
  }

  async function handleAvatar(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await upload(f);
    setAvatarUrl(url);
  }
  async function handleBanner(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await upload(f);
    setBannerUrl(url);
  }

  async function save() {
    try {
      setSaving(true);
      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          displayName,
          showUsername,
          profileImage: avatarUrl,
          bannerImage: bannerUrl
        })
      });
      if (!res.ok) throw new Error('Save failed');
      onSaved?.();
    } catch (e) {
      alert(e.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-cyan-600 bg-[#0f172a] p-4 space-y-4">
      {/* Banner */}
      <div className="relative h-24 rounded-lg overflow-hidden border border-cyan-600/60 bg-white/5">
        {bannerUrl ? (
          <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-xs text-white/60">No banner</div>
        )}
        <button
          onClick={() => bannerInputRef.current?.click()}
          className="absolute bottom-2 right-2 text-xs bg-cyan-400 text-black px-2 py-1 rounded-lg font-bold"
        >
          Change banner
        </button>
        <input type="file" accept="image/*" className="hidden" ref={bannerInputRef} onChange={handleBanner} />
      </div>

      {/* Avatar & display */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-600">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center bg-white/5 text-white/60">No avatar</div>
            )}
          </div>
          <button
            onClick={() => avatarInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 text-[10px] bg-cyan-400 text-black px-2 py-0.5 rounded-md font-bold"
          >
            Edit
          </button>
          <input type="file" accept="image/*" className="hidden" ref={avatarInputRef} onChange={handleAvatar} />
        </div>

        <div className="flex-1">
          <label className="block text-xs text-white/70 mb-1">Display name</label>
          <input
            value={displayName}
            onChange={e=>setDisplayName(e.target.value)}
            className="w-full bg-[#0b1220] border border-cyan-600 rounded-lg px-3 py-2 text-sm text-white"
            placeholder="Your display name"
          />
          <label className="mt-2 flex items-center gap-2 text-xs text-white/80">
            <input type="checkbox" checked={showUsername} onChange={e=>setShowUsername(e.target.checked)} />
            Show @username publicly
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          disabled={saving}
          onClick={save}
          className="px-4 py-2 rounded-lg bg-cyan-400 text-black font-bold disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
