export default function Header({ isLoggedIn, onLogin, onLogout }) {
  return (
    <header>
      <button className="menu-button">Menu</button>
      <nav className="nav-links">
        <a href="/">Home</a>
        <a href="/about">About</a>

        {!isLoggedIn ? (
          <button className="login-button" onClick={onLogin}>
            Log In
          </button>
        ) : (
          <button className="logout-button" onClick={onLogout}>
            Log Out
          </button>
        )}
      </nav>
    </header>
  )
}
