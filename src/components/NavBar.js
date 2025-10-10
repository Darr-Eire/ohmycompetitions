// components/NavBar.js

import Link from "next/link";

export default function NavBar() {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/competition">Competition</Link>
        </li>
        {/* Add other links as needed */}
      </ul>
    </nav>
  );
}
