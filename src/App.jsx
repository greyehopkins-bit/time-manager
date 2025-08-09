import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import { Plus, Trash2, Calendar as CalendarIcon, CheckCircle2, Clock, Timer, BookOpen, Briefcase } from "lucide-react";

// --- Simple helpers for localStorage persistence ---
const useLocalState = (key, initial) => {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
};

// --- UI Primitives (minimal so we don't depend on external shadcn setup) ---
const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl shadow-sm border bg-white ${className}`}>{children}</div>
);
const CardHeader = ({ className = "", children }) => (
  <div className={`p-4 border-b ${className}`}>{children}</div>
);
const CardContent = ({ className = "", children }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);
const Button = ({ className = "", children, ...props }) => (
  <button className={`px-3 py-2 rounded-xl border shadow-sm hover:shadow transition ${className}`} {...props}>{children}</button>
);
const Input = ({ className = "", ...props }) => (
  <input className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring ${className}`} {...props} />
);
const Textarea = ({ className = "", ...props }) => (
  <textarea className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring ${className}`} {...props} />
);
const Select = ({ className = "", children, ...props }) => (
  <select className={`w-full px-3 py-2 rounded-xl border bg-white ${className}`} {...props}>{children}</select>
);

// --- Layout ---
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-semibold text-xl">
            <Timer className="w-6 h-6" /> My Time Manager
          </Link>
          <nav className="ml-auto flex items-center gap-2 text-sm">
            <NavLink className={({isActive}) => `px-3 py-2 rounded-xl hover:bg-slate-100 transition flex items-center gap-2 ${isActive ? 'bg-slate-100' : ''}`} to="/calendar">
              <CalendarIcon className="w-4 h-4"/> Calendar
            </NavLink>
            <NavLink className={({isActive}) => `px-3 py-2 rounded-xl hover:bg-slate-100 transition flex items-center gap-2 ${isActive ? 'bg-slate-100' : ''}`} to="/jobs">
              <Briefcase className="w-4 h-4"/> Jobs
            </NavLink>
            <NavLink className={({isActive}) => `px-3 py-2 rounded-xl hover:bg-slate-100 transition flex items-center gap-2 ${isActive ? 'bg-slate-100' : ''}`} to="/schoolwork">
              <BookOpen className="w-4 h-4"/> Schoolwork
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      <footer className="py-6 text-center text-xs text-slate-500">Made for you — local-first (saves to your browser). Export coming soon.</footer>
    </div>
  );
};

// --- Utilities ---
const fmtDate = (dStr) => new Date(dStr + 'T00:00:00');
const toISODate = (d) => d.toISOString().slice(0,10);
const todayISO = () => toISODate(new Date());

// --- Calendar Page ---
function CalendarPage() {
  const [events, setEvents] = useLocalState('ptm_events', []);
  const [selected, setSelected] = useState(todayISO());
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(todayISO());

  const dayEvents = useMemo(() => events.filter(e => e.date === selected), [events, selected]);

  const addEvent = () => {
    if (!title.trim()) return;
    const newEvent = { id: crypto.randomUUID(), title: title.trim(), notes, date };
    setEvents([...events, newEvent]);
    setTitle("");
    setNotes("");
  };

  const delEvent = (id) => setEvents(events.filter(e => e.id !== id));

  // Simple month grid for current month of selected date
  const selectedDateObj = fmtDate(selected);
  const year = selectedDateObj.getFullYear();
  const month = selectedDateObj.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startDay = (firstOfMonth.getDay() + 6) % 7; // make Monday=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid = [];
  for (let i = 0; i < startDay; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(year, month, d));

  const changeMonth = (delta) => {
    const base = new Date(year, month + delta, Math.min(selectedDateObj.getDate(), 28));
    const iso = toISODate(base);
    setSelected(iso);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader className="flex items-center justify-between">
          <div className="font-semibold">Calendar</div>
          <div className="flex items-center gap-2">
            <Button onClick={() => changeMonth(-1)}>&larr; Prev</Button>
            <div className="px-3 py-2 rounded-xl border bg-slate-50">
              {selectedDateObj.toLocaleString(undefined,{month:'long', year:'numeric'})}
            </div>
            <Button onClick={() => changeMonth(1)}>Next &rarr;</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 text-xs font-medium text-slate-500 mb-2">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=> <div key={d} className="p-2 text-center">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {grid.map((d, i) => (
              <button
                key={i}
                onClick={() => d && setSelected(toISODate(d))}
                className={`aspect-square rounded-xl border p-2 text-left hover:shadow transition relative ${toISODate(d||new Date(0))===selected ? 'ring-2 ring-blue-500' : ''} ${d && toISODate(d)===todayISO() ? 'border-blue-400' : ''}`}
                disabled={!d}
              >
                <div className="text-xs font-medium">{d ? d.getDate() : ''}</div>
                {/* indicator dots for events */}
                {d && events.some(e => e.date === toISODate(d)) && (
                  <div className="absolute bottom-2 left-2 right-2 flex gap-1 flex-wrap">
                    {events.filter(e => e.date === toISODate(d)).slice(0,3).map(e => (
                      <span key={e.id} className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="font-semibold flex items-center gap-2"><CalendarIcon className="w-4 h-4"/> Add Event</div>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="text-sm">Title</label>
            <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., Study group"/>
            <label className="text-sm">Date</label>
            <Input type="date" value={date} onChange={e=>setDate(e.target.value)} />
            <label className="text-sm">Notes</label>
            <Textarea rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional details"/>
            <Button onClick={addEvent} className="bg-blue-600 text-white flex items-center gap-2"><Plus className="w-4 h-4"/> Add</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="font-semibold">Events on {new Date(selected+"T00:00:00").toLocaleDateString()}</div>
          </CardHeader>
          <CardContent className="space-y-2">
            {dayEvents.length === 0 && <div className="text-sm text-slate-500">No events yet.</div>}
            {dayEvents.map(e => (
              <div key={e.id} className="flex items-start gap-2 p-2 border rounded-xl">
                <div className="flex-1">
                  <div className="font-medium">{e.title}</div>
                  {e.notes && <div className="text-sm text-slate-600 whitespace-pre-wrap">{e.notes}</div>}
                </div>
                <Button onClick={()=>delEvent(e.id)} className="bg-red-50 text-red-700 border-red-200"><Trash2 className="w-4 h-4"/></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Jobs Page ---
function JobsPage() {
  const [jobs, setJobs] = useLocalState('ptm_jobs', []);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [due, setDue] = useState("");
  const [status, setStatus] = useState("pending");

  const addJob = () => {
    if (!title.trim()) return;
    const job = { id: crypto.randomUUID(), title: title.trim(), company: company.trim(), due, status };
    setJobs([job, ...jobs]);
    setTitle(""); setCompany(""); setDue(""); setStatus("pending");
  };

  const delJob = (id) => setJobs(jobs.filter(j => j.id !== id));
  const setJobStatus = (id, s) => setJobs(jobs.map(j => j.id===id ? {...j, status:s} : j));

  const statusBadge = (s) => ({
    completed: "bg-green-100 text-green-700 border-green-200",
    late: "bg-red-100 text-red-700 border-red-200",
    pending: "bg-amber-100 text-amber-800 border-amber-200",
  }[s] || "bg-slate-100 text-slate-700 border-slate-200");

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader className="font-semibold flex items-center gap-2"><Briefcase className="w-4 h-4"/> Add Job</CardHeader>
        <CardContent className="space-y-3">
          <label className="text-sm">Title</label>
          <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., Summer internship app"/>
          <label className="text-sm">Company / Org</label>
          <Input value={company} onChange={e=>setCompany(e.target.value)} placeholder="Optional"/>
          <label className="text-sm">Due date</label>
          <Input type="date" value={due} onChange={e=>setDue(e.target.value)} />
          <label className="text-sm">Status</label>
          <Select value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="late">Late</option>
          </Select>
          <Button onClick={addJob} className="bg-blue-600 text-white flex items-center gap-2"><Plus className="w-4 h-4"/> Add</Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="flex items-center justify-between">
          <div className="font-semibold">Jobs</div>
          <div className="text-xs text-slate-500">Click status to change it</div>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3">
          {jobs.length === 0 && <div className="text-sm text-slate-500">No jobs yet.</div>}
          {jobs.map(j => (
            <div key={j.id} className="border rounded-2xl p-3 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{j.title}</div>
                  {j.company && <div className="text-sm text-slate-600">{j.company}</div>}
                </div>
                <Button onClick={()=>delJob(j.id)} className="bg-red-50 text-red-700 border-red-200"><Trash2 className="w-4 h-4"/></Button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="text-slate-600">{j.due ? new Date(j.due+"T00:00:00").toLocaleDateString() : "No due date"}</div>
                <Select value={j.status} onChange={e=>setJobStatus(j.id, e.target.value)} className={`w-auto ${statusBadge(j.status)}`}>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="late">Late</option>
                </Select>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// --- Schoolwork Page ---
function SchoolworkPage() {
  const [todos, setTodos] = useLocalState('ptm_todos', []);
  const [todoText, setTodoText] = useState("");
  const [todoDue, setTodoDue] = useState("");

  const [week, setWeek] = useLocalState('ptm_weekplan', {
    Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
  });

  const addTodo = () => {
    const txt = todoText.trim();
    if (!txt) return;
    const item = { id: crypto.randomUUID(), text: txt, done: false, due: todoDue };
    setTodos([item, ...todos]);
    setTodoText(""); setTodoDue("");
  };
  const toggleTodo = (id) => setTodos(todos.map(t => t.id===id ? {...t, done: !t.done} : t));
  const delTodo = (id) => setTodos(todos.filter(t => t.id !== id));

  const [newPlan, setNewPlan] = useState({ day: 'Mon', subject: '', time: '', notes: '' });
  const addPlan = () => {
    if (!newPlan.subject.trim()) return;
    const item = { id: crypto.randomUUID(), ...newPlan };
    setWeek({ ...week, [newPlan.day]: [...week[newPlan.day], item] });
    setNewPlan({ day: newPlan.day, subject: '', time: '', notes: '' });
  };
  const delPlan = (day, id) => setWeek({ ...week, [day]: week[day].filter(x => x.id !== id) });

  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left: Todos */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> To‑Dos</div>
          <div className="text-xs text-slate-500">Click item to toggle done</div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <Input value={todoText} onChange={e=>setTodoText(e.target.value)} placeholder="e.g., APUSH Chapter 3 notes"/>
            <Input type="date" value={todoDue} onChange={e=>setTodoDue(e.target.value)} />
            <Button onClick={addTodo} className="bg-blue-600 text-white flex items-center gap-2"><Plus className="w-4 h-4"/> Add</Button>
          </div>
          <div className="space-y-2">
            {todos.length === 0 && <div className="text-sm text-slate-500">No tasks yet.</div>}
            {todos.map(t => (
              <div key={t.id} className={`flex items-center justify-between border rounded-xl p-2 ${t.done ? 'opacity-70' : ''}`}>
                <button onClick={()=>toggleTodo(t.id)} className="flex-1 text-left">
                  <div className={`font-medium ${t.done ? 'line-through' : ''}`}>{t.text}</div>
                  <div className="text-xs text-slate-600">{t.due ? new Date(t.due+"T00:00:00").toLocaleDateString() : 'No due date'}</div>
                </button>
                <Button onClick={()=>delTodo(t.id)} className="bg-red-50 text-red-700 border-red-200"><Trash2 className="w-4 h-4"/></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Right: Week View */}
      <Card>
        <CardHeader className="font-semibold">Weekly Study Plan</CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-4 gap-2">
            <Select value={newPlan.day} onChange={e=>setNewPlan(p=>({...p, day: e.target.value}))}>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </Select>
            <Input value={newPlan.subject} onChange={e=>setNewPlan(p=>({...p, subject: e.target.value}))} placeholder="Subject / task"/>
            <Input value={newPlan.time} onChange={e=>setNewPlan(p=>({...p, time: e.target.value}))} placeholder="Time (e.g., 4–5pm)"/>
            <Button onClick={addPlan} className="bg-blue-600 text-white flex items-center gap-2"><Plus className="w-4 h-4"/> Add</Button>
          </div>
          <Textarea rows={2} value={newPlan.notes} onChange={e=>setNewPlan(p=>({...p, notes: e.target.value}))} placeholder="Notes (optional)"/>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {days.map(d => (
              <div key={d} className="border rounded-2xl p-3 bg-slate-50">
                <div className="font-semibold mb-2">{d}</div>
                <div className="space-y-2">
                  {week[d].length === 0 && <div className="text-xs text-slate-500">No plans yet.</div>}
                  {week[d].map(item => (
                    <div key={item.id} className="bg-white border rounded-xl p-2">
                      <div className="text-sm font-medium">{item.subject} {item.time && <span className="text-slate-500">• {item.time}</span>}</div>
                      {item.notes && <div className="text-xs text-slate-600 whitespace-pre-wrap">{item.notes}</div>}
                      <div className="flex justify-end">
                        <Button onClick={()=>delPlan(d, item.id)} className="bg-red-50 text-red-700 border-red-200 text-xs"><Trash2 className="w-3 h-3"/></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Landing Page ---
function HomePage() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex items-center gap-2 font-semibold"><CalendarIcon className="w-4 h-4"/> Calendar</CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">Add events and view them on a clean monthly grid. Click a date to see its events.</p>
          <Link to="/calendar"><Button className="bg-blue-600 text-white">Open Calendar</Button></Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center gap-2 font-semibold"><Briefcase className="w-4 h-4"/> Jobs</CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">Track applications and tasks. Set status to Pending, Completed, or Late.</p>
          <Link to="/jobs"><Button className="bg-blue-600 text-white">Open Jobs</Button></Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center gap-2 font-semibold"><BookOpen className="w-4 h-4"/> Schoolwork</CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">Left: to‑dos. Right: weekly study plan with day-by-day buckets.</p>
          <Link to="/schoolwork"><Button className="bg-blue-600 text-white">Open Schoolwork</Button></Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage/>} />
          <Route path="/calendar" element={<CalendarPage/>} />
          <Route path="/jobs" element={<JobsPage/>} />
          <Route path="/schoolwork" element={<SchoolworkPage/>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

