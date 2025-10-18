import React, { useState } from 'react';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import {
  Box,
  Typography,
  Grid,
  Button,
  Paper,
  InputLabel,
  Input,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function UploadForm({ setMatchedSkills, setMissingSkills, setSkillSuggestions, userId }) {
  const [resumeText, setResumeText] = useState('');
  const [jobText, setJobText] = useState('');
  const [localSuggestions, setLocalSuggestions] = useState([]);
  const [matchedSkills, setMatched] = useState([]);
  const [missingSkills, setMissing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const extractTextFromFile = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'txt') return await file.text();

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
      console.log('Resume text:', text);
    }
  };

  const handleJobChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const text = await extractTextFromFile(file);
      setJobText(text);
      console.log('Job description text:', text);
    }
  };

  const analyzeTextWithTextRazor = async (text) => {
    try {
      const response = await fetch('http://localhost:3001/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const data = await response.json();
      console.log('TextRazor response:', data);

      if (!data.response?.entities) return [];
      return data.response.entities
        .filter(entity => entity.confidenceScore > 0.4)
        .map(entity => entity.entityId?.toLowerCase())
        .filter(Boolean);
    } catch (error) {
      console.error('TextRazor error:', error);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const resumeSkills = await analyzeTextWithTextRazor(resumeText);
      const jobSkills = await analyzeTextWithTextRazor(jobText);

      console.log('Extracted Resume Skills:', resumeSkills);
      console.log('Extracted Job Skills:', jobSkills);

      const matched = jobSkills.filter(skill => resumeSkills.includes(skill));
      const missing = jobSkills.filter(skill => !resumeSkills.includes(skill));
      const suggestions = missing.map(skill => ({
        skill,
        advice: 'Consider learning this skill'
      }));

      console.log('Matched Skills:', matched);
      console.log('Missing Skills:', missing);

      setMatched(matched);
      setMissing(missing);
      setMatchedSkills(matched);
      setMissingSkills(missing);
      setSkillSuggestions(suggestions);
      setLocalSuggestions(suggestions);

      localStorage.setItem('matchedSkills', JSON.stringify(matched));
      localStorage.setItem('missingSkills', JSON.stringify(missing));
      localStorage.setItem('activeTab', 2);

      setMessage(
        matched.length || missing.length
          ? '✅ Skills matched successfully!'
          : '⚠️ No skills matched or missing. Try uploading clearer resume and JD files.'
      );
    } catch (error) {
      console.error('TextRazor error:', error);
      setMessage('❌ Failed to analyze text. Check your backend or API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    let report = 'Explainable Recruitment Report\n\n';

    report += '✅ Matched Skills:\n';
    matchedSkills.forEach(skill => {
      report += `- ${skill}\n`;
    });

    report += '\n❌ Missing Skills & Suggestions:\n';
    localSuggestions.forEach(({ skill, advice }) => {
      report += `- ${skill}: ${advice}\n`;
    });

    fetch('http://localhost:3001/save-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matched: matchedSkills,
        missing: missingSkills,
        suggestions: localSuggestions,
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
    <Paper elevation={2} sx={{ p: 3, backgroundColor: '#1e1e1e', color: '#fff' }}>
      <Typography variant="h6" color="primary" gutterBottom>
        📤 Upload Resume & Job Description
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <InputLabel sx={{ color: '#ccc' }}>Resume File</InputLabel>
            <Input type="file" fullWidth onChange={handleResumeChange} inputProps={{ accept: '.txt,.pdf,.docx' }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InputLabel sx={{ color: '#ccc' }}>Job Description File</InputLabel>
            <Input type="file" fullWidth onChange={handleJobChange} inputProps={{ accept: '.txt,.pdf,.docx' }} />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="secondary" fullWidth>
              🔍 Extract & Match Skills
            </Button>
          </Grid>
        </Grid>
      </form>

      {loading && (
        <Typography variant="body2" sx={{ mt: 2, color: '#ccc' }}>
          ⏳ Matching skills, please wait...
        </Typography>
      )}

      {message && (
        <Typography variant="body2" sx={{ mt: 2, color: message.includes('✅') ? 'lightgreen' : 'tomato' }}>
          {message}
        </Typography>
      )}

      {localSuggestions.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 2, bgcolor: '#444' }} />
          <Typography variant="subtitle1" color="warning.main" gutterBottom>
            ❌ Missing Skills & Suggestions
          </Typography>
          <List dense>
            {localSuggestions.map(({ skill, advice }, index) => (
              <ListItem key={index} sx={{ color: 'orange' }}>
                <ListItemText primary={`${skill}: ${advice}`} />
              </ListItem>
            ))}
          </List>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleDownload}
            sx={{ mt: 2 }}
          >
            📄 Download & Save Report
          </Button>
        </Box>
      )}
    </Paper>
  );
}

export default UploadForm;
