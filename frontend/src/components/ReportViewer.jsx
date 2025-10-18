// src/components/ReportViewer.jsx
import React, { useEffect, useState } from 'react';

function ReportViewer({ userId }) {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReports = () => {
    fetch(`http://localhost:3001/get-reports/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReports(data.reports);
          setFilteredReports(data.reports);
        }
      })
      .catch(err => console.error('Error loading reports:', err));
  };

  useEffect(() => {
    if (userId) {
      fetchReports();
    }
  }, [userId]);

  const handleDelete = (id) => {
    fetch(`http://localhost:3001/delete-report/${id}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchReports(); // refresh list
        }
      })
      .catch(err => console.error('Error deleting report:', err));
  };

  const handleFilter = () => {
    const filtered = reports.filter(report => {
      const created = new Date(report.created_at);
      const matchesSearch = searchTerm === '' || JSON.parse(report.matched).some(skill =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesDate =
        (!startDate || created >= new Date(startDate)) &&
        (!endDate || created <= new Date(endDate));
      return matchesSearch && matchesDate;
    });
    setFilteredReports(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [searchTerm, startDate, endDate, reports]);

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>📊 Saved Reports</h2>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search by skill..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          style={{ marginRight: '0.5rem' }}
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />
      </div>

      {filteredReports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <ul>
          {filteredReports.map(report => (
            <li key={report.id} style={{ marginBottom: '1rem' }}>
              <strong>Report #{report.id}</strong> ({new Date(report.created_at).toLocaleString()})
              <br />
              ✅ Matched: {JSON.parse(report.matched).join(', ')}
              <br />
              ❌ Missing: {JSON.parse(report.missing).join(', ')}
              <br />
              💡 Suggestions:
              <ul>
                {JSON.parse(report.suggestions).map((s, i) => (
                  <li key={i}>{s.skill}: {s.advice}</li>
                ))}
              </ul>
              <button onClick={() => handleDelete(report.id)} style={{ marginTop: '0.5rem' }}>
                🗑️ Delete Report
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ReportViewer;
