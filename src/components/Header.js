// src/components/header.js
export default function Header({ isLoggedIn, onLogout }) {
  return (
    <header>
      <button className="menu-button">Menu</button>

      <nav className="nav-links">
        <a href="/">Home</a>
        <a href="/about">About</a>
        {/* show logout when logged in */}
        {isLoggedIn && (
          <button className="logout-button" onClick={onLogout}>
            Log Out
          </button>
        )}
      </nav>
    </header>
  )
}
