import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

function CalendarPage() {
  const [events, setEvents] = useState([])
  const [input, setInput] = useState('')
  return (
    <div className="container">
      <h2>Calendar</h2>
      <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="New Event" />
      <button onClick={() => { setEvents([...events, input]); setInput('') }}>Add</button>
      <ul>{events.map((e, i) => <li key={i}>{e}</li>)}</ul>
    </div>
  )
}

function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [input, setInput] = useState('')
  const statuses = ['Pending', 'Completed', 'Late']

  return (
    <div className="container">
      <h2>Jobs</h2>
      <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="New Job" />
      <button onClick={() => { setJobs([...jobs, { name: input, status: 'Pending' }]); setInput('') }}>Add</button>
      <ul>
        {jobs.map((job, i) => (
          <li key={i}>
            {job.name} - {job.status}
            <select value={job.status} onChange={(e) => {
              const newJobs = [...jobs]
              newJobs[i].status = e.target.value
              setJobs(newJobs)
            }}>
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => setJobs(jobs.filter((_, idx) => idx !== i))}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SchoolworkPage() {
  const [todos, setTodos] = useState([])
  const [input, setInput] = useState('')
  return (
    <div className="container" style={{ display: 'flex', gap: '2rem' }}>
      <div style={{ flex: 1 }}>
        <h2>To-Dos</h2>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="New Task" />
        <button onClick={() => { setTodos([...todos, input]); setInput('') }}>Add</button>
        <ul>{todos.map((t, i) => <li key={i}>{t}</li>)}</ul>
      </div>
      <div style={{ flex: 1 }}>
        <h2>Weekly Plan</h2>
        <textarea style={{ width: '100%', height: '200px' }} placeholder="Write your weekly plan here..."></textarea>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Calendar</Link>
        <Link to="/jobs">Jobs</Link>
        <Link to="/schoolwork">Schoolwork</Link>
      </nav>
      <Routes>
        <Route path="/" element={<CalendarPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/schoolwork" element={<SchoolworkPage />} />
      </Routes>
    </Router>
  )
}
