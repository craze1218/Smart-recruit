// src/components/UploadForm.jsx
import React, { useState } from 'react';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function UploadForm({ setMatchedSkills, setMissingSkills, setSkillSuggestions, userId }) {
  const [resumeText, setResumeText] = useState('');
  const [jobText, setJobText] = useState('');
  const [skillSuggestions, setLocalSuggestions] = useState([]);

  const skillKeywords = [
    'JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker',
    'SQL', 'MongoDB', 'HTML', 'CSS', 'Git', 'REST', 'GraphQL',
    'Kubernetes', 'TypeScript', 'Java', 'C++', 'Linux', 'Agile'
  ];

  const suggestionMap = {
    'AWS': 'Consider cloud certification',
    'Docker': 'Can be learned quickly with tutorials',
    'GraphQL': 'Optional but useful for APIs',
    'Kubernetes': 'Advanced skill, consider training',
    'TypeScript': 'Improves code safety, easy to adopt',
    'Agile': 'Soft skill, can be learned on the job',
    'Git': 'Essential for collaboration',
    'React': 'Core frontend skill, learn via projects',
    'Node.js': 'Backend JavaScript, good to know',
    'Python': 'Widely used, beginner-friendly',
    'SQL': 'Important for data roles',
    'MongoDB': 'NoSQL alternative, learn basics',
    'Linux': 'Useful for devops and servers',
    'Java': 'Common in enterprise apps',
    'C++': 'Used in performance-critical systems'
  };

  const extractTextFromFile = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'txt') {
      return await file.text();
    }

    if (ext === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    if (ext === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
      }
      return text;
    }

    return '';
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const text = await extractTextFromFile(file);
      setResumeText(text);
    }
  };

  const handleJobChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const text = await extractTextFromFile(file);
      setJobText(text);
    }
  };

  const extractSkills = (text) => {
    const lowerText = text.toLowerCase();
    return skillKeywords.filter(skill =>
      lowerText.includes(skill.toLowerCase())
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const resumeSkills = extractSkills(resumeText);
    const jobSkills = extractSkills(jobText);

    const matched = jobSkills.filter(skill => resumeSkills.includes(skill));
    const missing = jobSkills.filter(skill => !resumeSkills.includes(skill));
    const suggestions = missing.map(skill => ({
      skill,
      advice: suggestionMap[skill] || 'Consider learning this skill'
    }));

    setMatchedSkills(matched);
    setMissingSkills(missing);
    setSkillSuggestions(suggestions);
    setLocalSuggestions(suggestions);
  };

  const handleDownload = () => {
    let report = 'Explainable Recruitment Report\n\n';

    report += '✅ Matched Skills:\n';
    setMatchedSkills.forEach(skill => {
      report += `- ${skill}\n`;
    });

    report += '\n❌ Missing Skills & Suggestions:\n';
    skillSuggestions.forEach(({ skill, advice }) => {
      report += `- ${skill}: ${advice}\n`;
    });

    // Save report to backend with userId
    fetch('http://localhost:3001/save-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matched: matchedSkills,
        missing: missingSkills,
        suggestions: skillSuggestions,
        userId
      })
    })
      .then(res => res.json())
      .then(data => {
        console.log('Report saved with ID:', data.id);
      })
      .catch(err => console.error('Error saving report:', err));

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'recruitment-report.txt';
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>Upload Resume & Job Description (.txt, .pdf, .docx)</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Resume:</label>
          <input type="file" accept=".txt,.pdf,.docx" onChange={handleResumeChange} />
        </div>
        <div>
          <label>Job Description:</label>
          <input type="file" accept=".txt,.pdf,.docx" onChange={handleJobChange} />
        </div>
        <button type="submit">Extract & Match</button>
      </form>

      <div style={{ marginTop: '2rem' }}>
        <h3>❌ Missing Skills & Suggestions</h3>
        <ul>
          {skillSuggestions.map(({ skill, advice }, index) => (
            <li key={index} style={{ color: 'red' }}>
              <strong>{skill}</strong>: {advice}
            </li>
          ))}
        </ul>

        {skillSuggestions.length > 0 && (
          <button onClick={handleDownload} style={{ marginTop: '1rem' }}>
            📄 Download & Save Report
          </button>
        )}
      </div>
    </div>
  );
}

export default UploadForm;
