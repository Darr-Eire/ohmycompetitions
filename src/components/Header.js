'use client';

import PiLoginButton from './PiLoginButton';

export default function Header() {
  return (
    <header className="w-full p-4 bg-white shadow flex justify-between items-center">
      <h1 className="text-xl font-bold">OhMyCompetitions</h1>
      <PiLoginButton />
    </header>
  );
}
