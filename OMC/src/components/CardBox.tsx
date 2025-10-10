export default function CardBox({ title, icon, children }: {
    title: string;
    icon: string;
    children: React.ReactNode;
  }) {
    return (
      <div className="bg-[#0b1120] border border-blue-500 rounded-xl shadow-xl text-white">
        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-t-xl px-4 py-2">
          <h2 className="uppercase font-bold text-black flex items-center gap-2 text-sm">
            <span>{icon}</span> {title}
          </h2>
        </div>
        <div className="p-4 space-y-2">{children}</div>
      </div>
    );
  }
  