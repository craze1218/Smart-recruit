import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Paper,
  Container
} from '@mui/material';
import { motion } from 'framer-motion';
import SkillHeatmap from './SkillHeatmap';
import ReportViewer from './ReportViewer';
import ProfileSummary from './ProfileSummary';
import UploadForm from './UploadForm';

export default function Dashboard() {
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const userId = localStorage.getItem('userId');

  // 🔁 Rehydrate skills from localStorage on mount
  useEffect(() => {
    const storedMatched = JSON.parse(localStorage.getItem('matchedSkills')) || [];
    const storedMissing = JSON.parse(localStorage.getItem('missingSkills')) || [];
    setMatchedSkills(storedMatched);
    setMissingSkills(storedMissing);
  }, []);

  const sections = [
    'Saved Reports',
    'Profile Summary',
    'Matched Skills',
    'Common Gaps',
    'Upload'
  ];

  const tabMotion = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h5" color="primary">
          📊 Dashboard Overview
        </Typography>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        centered
        textColor="secondary"
        indicatorColor="secondary"
        sx={{ mb: 3 }}
      >
        {sections.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      <Paper
        elevation={3}
        sx={{
          p: 3,
          backgroundColor: '#121212',
          minHeight: '400px',
          overflowY: 'auto',
          borderRadius: 2
        }}
      >
        {activeTab === 0 && (
          <motion.div {...tabMotion}>
            <Typography variant="h6" color="primary" gutterBottom>
              📁 Saved Reports
            </Typography>
            <ReportViewer userId={userId} />
          </motion.div>
        )}
        {activeTab === 1 && (
          <motion.div {...tabMotion}>
            <Typography variant="h6" color="primary" gutterBottom>
              🧾 Profile Summary
            </Typography>
            <ProfileSummary userId={userId} />
          </motion.div>
        )}
        {activeTab === 2 && (
          <motion.div {...tabMotion}>
            <Typography variant="h6" color="primary" gutterBottom>
              ✅ Matched Skills
            </Typography>
            <SkillHeatmap
              matchedSkills={matchedSkills}
              missingSkills={[]}
              viewType="matched"
            />
          </motion.div>
        )}
        {activeTab === 3 && (
          <motion.div {...tabMotion}>
            <Typography variant="h6" color="primary" gutterBottom>
              ⚠️ Common Gaps
            </Typography>
            <SkillHeatmap
              matchedSkills={[]}
              missingSkills={missingSkills}
              viewType="missing"
            />
          </motion.div>
        )}
        {activeTab === 4 && (
          <motion.div {...tabMotion}>
            <Typography variant="h6" color="primary" gutterBottom>
              📤 Upload JD & Resume
            </Typography>
            <UploadForm
              setMatchedSkills={(skills) => {
                setMatchedSkills(skills);
                localStorage.setItem('matchedSkills', JSON.stringify(skills));
              }}
              setMissingSkills={(skills) => {
                setMissingSkills(skills);
                localStorage.setItem('missingSkills', JSON.stringify(skills));
              }}
              setSkillSuggestions={setSkillSuggestions}
              userId={userId}
            />
          </motion.div>
        )}
      </Paper>
    </Container>
  );
}
