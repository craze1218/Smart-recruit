// src/components/SkillHeatmap.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function SkillHeatmap({ matchedSkills, missingSkills }) {
  const allSkills = [...matchedSkills, ...missingSkills];

  const data = {
    labels: allSkills,
    datasets: [
      {
        label: 'Skill Match Intensity',
        data: allSkills.map(skill =>
          matchedSkills.includes(skill) ? 1 : 0.3
        ),
        backgroundColor: allSkills.map(skill =>
          matchedSkills.includes(skill) ? 'green' : 'red'
        )
      }
    ]
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 1
      }
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Missing Skill Heatmap</h2>
      <Bar data={data} options={options} />
    </div>
  );
}

export default SkillHeatmap;
