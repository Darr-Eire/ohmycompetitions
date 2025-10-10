'use client';
import TutorialOverlay from 'components/TutorialOverlay';

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-[#0a1024] flex items-center justify-center text-white">
      <TutorialOverlay forceShow={true} />
    </div>
  );
}
