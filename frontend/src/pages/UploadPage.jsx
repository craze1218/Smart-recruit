import UploadForm from '../components/UploadForm';
import { useState } from 'react';

export default function UploadPage() {
  const userId = localStorage.getItem('userId');
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [skillSuggestions, setSkillSuggestions] = useState([]);

  return (
    <div>
      <h2>📤 Upload Resume</h2>
      <UploadForm
        setMatchedSkills={setMatchedSkills}
        setMissingSkills={setMissingSkills}
        setSkillSuggestions={setSkillSuggestions}
        userId={userId}
      />
    </div>
  );
}
