// src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import UploadForm from './components/UploadForm';
import SkillHeatmap from './components/SkillHeatmap';
import ReportViewer from './components/ReportViewer';
import LoginForm from './components/LoginForm';
import ProfileSummary from './components/ProfileSummary';


function App() {
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) setUserId(savedUserId);
  }, []);

  useEffect(() => {
    localStorage.setItem('matchedSkills', JSON.stringify(matchedSkills));
    localStorage.setItem('missingSkills', JSON.stringify(missingSkills));
    localStorage.setItem('skillSuggestions', JSON.stringify(skillSuggestions));
  }, [matchedSkills, missingSkills, skillSuggestions]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    setUserId(null);
    setMatchedSkills([]);
    setMissingSkills([]);
    setSkillSuggestions([]);
  };

  return (
    <div className="app-container">
      <header>
        <h1>🧠 Explainable Recruitment Dashboard</h1>
        <p>Understand why candidates match—skills, projects, and gaps.</p>
        {userId && (
          <button onClick={handleLogout} style={{ float: 'right', marginTop: '-2rem' }}>
            🚪 Logout
          </button>
        )}
      </header>

      <main>
        <main>
  {!userId ? (
    <LoginForm setUserId={setUserId} />
  ) : (
    <>
      <UploadForm
        setMatchedSkills={setMatchedSkills}
        setMissingSkills={setMissingSkills}
        setSkillSuggestions={setSkillSuggestions}
        userId={userId}
      />
      <SkillHeatmap
        matchedSkills={matchedSkills}
        missingSkills={missingSkills}
      />
      <ReportViewer userId={userId} />
      <ProfileSummary userId={userId} />
    </>
  )}
</main>

      </main>

      <footer>
        <p>Built with React + Vite</p>
      </footer>
    </div>
  );
}

export default App;
