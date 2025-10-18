import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ marginBottom: "2rem" }}>
      <Link to="/" style={{ marginRight: "1rem" }}>🏠 Dashboard</Link>
      <Link to="/upload" style={{ marginRight: "1rem" }}>📤 Upload</Link>
      <Link to="/candidates">👥 Candidates</Link>
    </nav>
  );
}

