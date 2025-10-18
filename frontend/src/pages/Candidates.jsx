export default function Candidates() {
  const matchedSkills = JSON.parse(localStorage.getItem('matchedSkills')) || [];
  const missingSkills = JSON.parse(localStorage.getItem('missingSkills')) || [];
  const skillSuggestions = JSON.parse(localStorage.getItem('skillSuggestions')) || [];

  return (
    <div>
      <h2>👥 Candidates</h2>
      <p><strong>Matched Skills:</strong> {matchedSkills.join(', ')}</p>
      <p><strong>Missing Skills:</strong> {missingSkills.join(', ')}</p>
      <p><strong>Suggested Skills:</strong> {skillSuggestions.join(', ')}</p>
    </div>
  );
}
