import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  Paper,
} from '@mui/material';

const sections = ['Home', 'About', 'Gallery', 'Contact'];

const contentMap = {
  Home: '🏠 Welcome to the Home section. Here you’ll find the latest updates and highlights.',
  About: '📖 This is the About section. Learn more about our mission and team.',
  Gallery: '🖼️ Explore our Gallery. Browse through snapshots from 2016, 2018, and 2021.',
  Contact: '📬 Reach out to us via the Contact section. We’d love to hear from you!',
};

function NavSections() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff' }}>
      <AppBar position="static" sx={{ backgroundColor: '#1a1a1a' }}>
        <Toolbar sx={{ justifyContent: 'center' }}>
          <Typography variant="h6" color="primary">
            🎨 New Design 2023
          </Typography>
        </Toolbar>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          centered
          textColor="secondary"
          indicatorColor="secondary"
        >
          {sections.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      </AppBar>

      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: 3, maxWidth: 600, backgroundColor: '#121212' }}>
          <Typography variant="body1" color="text.secondary">
            {contentMap[sections[activeTab]]}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

export default NavSections;
