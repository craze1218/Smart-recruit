// src/components/ProfileSummary.jsx
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ProfileSummary({ userId }) {
  const [reports, setReports] = useState([]);
  const [topMatched, setTopMatched] = useState([]);
  const [topMissing, setTopMissing] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3001/get-reports/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReports(data.reports);
          analyzeSkills(data.reports);
        }
      })
      .catch(err => console.error('Error loading reports:', err));
  }, [userId]);

  const analyzeSkills = (reports) => {
    const matchCount = {};
    const missCount = {};

    reports.forEach(report => {
      const matched = JSON.parse(report.matched);
      const missing = JSON.parse(report.missing);

      matched.forEach(skill => {
        matchCount[skill] = (matchCount[skill] || 0) + 1;
      });

      missing.forEach(skill => {
        missCount[skill] = (missCount[skill] || 0) + 1;
      });
    });

    const topMatched = Object.entries(matchCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topMissing = Object.entries(missCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    setTopMatched(topMatched);
    setTopMissing(topMissing);
  };

  const matchedChartData = {
    labels: topMatched.map(([skill]) => skill),
    datasets: [
      {
        label: 'Matched Skills',
        data: topMatched.map(([, count]) => count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      }
    ]
  };

  const missingChartData = {
    labels: topMissing.map(([skill]) => skill),
    datasets: [
      {
        label: 'Missing Skills',
        data: topMissing.map(([, count]) => count),
        backgroundColor: 'rgba(255, 99, 132, 0.6)'
      }
    ]
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>👤 Profile Summary</h2>
      <p>Total Reports: {reports.length}</p>

      <div style={{ marginBottom: '2rem' }}>
        <h4>✅ Top Matched Skills</h4>
        <Bar data={matchedChartData} options={{ responsive: true }} />
      </div>

      <div>
        <h4>❌ Most Common Gaps</h4>
        <Bar data={missingChartData} options={{ responsive: true }} />
      </div>
    </div>
  );
}

export default ProfileSummary;
