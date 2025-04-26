// src/components/footer.js
import {
    FaTwitter,
    FaFacebookF,
    FaInstagram,
    FaDiscord,
  } from 'react-icons/fa'
  
  export default function Footer() {
    return (
      <footer>
        <div className="social-icons">
          <a
            href="https://twitter.com/yourprofile"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
          >
            <FaTwitter />
          </a>
          <a
            href="https://facebook.com/yourprofile"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <FaFacebookF />
          </a>
          <a
            href="https://instagram.com/yourprofile"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href="https://discord.gg/yourinvite"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Discord"
          >
            <FaDiscord />
          </a>
        </div>
  
        <div className="footer-links">
          <a href="/terms">Terms &amp; Conditions</a>
          <a href="/privacy">Privacy Policy</a>
        </div>
  
        <p>© {new Date().getFullYear()} OhMyCompetitions </p>
      </footer>
    )
  }
  