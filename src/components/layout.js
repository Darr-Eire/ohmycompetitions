// components/Layout.js
export default function Layout({ children }) {
    return (
      <>
        <header>
          <h1 className="text-xl font-bold">Oh My Competitions</h1>
        </header>
        <main>{children}</main>
        <footer>
          © {new Date().getFullYear()} Oh My Competitions
        </footer>
      </>
    )
  }
  