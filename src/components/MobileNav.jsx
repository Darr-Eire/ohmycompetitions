import Link from "next/link";
import { useRouter } from "next/router";

export function MobileNav() {
  const { pathname } = useRouter();
  const Item = ({ href, label }) => (
    <Link href={href} className={`flex-1 text-center py-2 touch-target ${pathname===href ? "font-semibold" : ""}`}>
      {label}
    </Link>
  );
  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#071426]/90 backdrop-blur safe-bot border-t border-white/10 md:hidden"
    >
      <div className="container flex items-center gap-1">
        <Item href="/" label="Home" />
        <Item href="/competitions/live-now" label="Live" />
        <Item href="/competitions/results" label="Results" />
        <Item href="/account" label="Account" />
      </div>
    </nav>
  );
}
