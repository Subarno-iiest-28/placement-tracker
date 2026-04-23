
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

/* Format date */
function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}


function App() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ company: "", role: "" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isSignup, setIsSignup] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("latest");
  const [darkMode, setDarkMode] = useState(false);
  
  
  
const exportData = () => {
  const rows = jobs.map(j => `${j.company},${j.role},${j.status}`);
  const csv = "Company,Role,Status\n" + rows.join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "jobs.csv";
  a.click();
};

let filteredJobs = jobs.filter(job =>
  job.company.toLowerCase().includes(search.toLowerCase()) &&
  (filter === "All" || job.status === filter)
);

filteredJobs = filteredJobs.sort((a, b) =>
  sort === "latest"
    ? new Date(b.createdAt) - new Date(a.createdAt)
    : new Date(a.createdAt) - new Date(b.createdAt)
);


  /* Fetch */
  const fetchJobs = useCallback(async () => {
    const res = await axios.get("http://localhost:5000/api/jobs", {
      headers: { Authorization: token }
    });
    setJobs(res.data);
  }, [token]);

  useEffect(() => {
    if (token) fetchJobs();
  }, [fetchJobs]);

  /* Auth */
  const handleSignup = async () => {
    await axios.post("http://localhost:5000/api/auth/signup", { email, password });
    alert("Signup successful");
    setIsSignup(false);
  };

  const handleLogin = async () => {
    const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  /* Add */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company || !form.role) return;

    await axios.post("http://localhost:5000/api/jobs", form, {
      headers: { Authorization: token }
    });

    setForm({ company: "", role: "" });
    fetchJobs();
  };

  /* Update */
  const updateStatus = async (id, status) => {
    await axios.put(`http://localhost:5000/api/jobs/${id}`, { status }, {
      headers: { Authorization: token }
    });
    fetchJobs();
  };

  const updateInterviewDate = async (id, date) => {
    await axios.put(`http://localhost:5000/api/jobs/${id}`, { interviewDate: date }, {
      headers: { Authorization: token }
    });
    fetchJobs();
  };

  /* Delete */
  const deleteJob = async (id) => {
    await axios.delete(`http://localhost:5000/api/jobs/${id}`, {
      headers: { Authorization: token }
    });
    fetchJobs();
  };

  /* Chart */
  const statusCount = { Applied: 0, OA: 0, Interview: 0, Rejected: 0 };
  jobs.forEach(j => statusCount[j.status]++);

  const chartData = Object.keys(statusCount).map(key => ({
    status: key,
    count: statusCount[key]
  }));



  /* Login UI */
  if (!token) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="card p-4 shadow" style={{ width: "350px" }}>
          <h3 className="text-center mb-3">{isSignup ? "Signup" : "Login"}</h3>
          <input className="form-control mb-3" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="form-control mb-3" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

          {isSignup ? (
            <button className="btn btn-success w-100 mb-2" onClick={handleSignup}>Signup</button>
          ) : (
            <button className="btn btn-primary w-100 mb-2" onClick={handleLogin}>Login</button>
          )}

          <button className="btn btn-link" onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? "Already have account?" : "New user? Signup"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
    className={`container mt-4 ${darkMode ? "bg-dark text-light" : ""}`} 
    style={{ minHeight: "100vh" }}
    >

      <div className={`d-flex justify-content-between mb-4 p-3 rounded 
      ${darkMode ? "bg-dark text-light" : ""}`}>
        <h2>Placement Tracker</h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "Light" : "Dark"}
          </button>

          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="row g-2 mb-4">
        <div className="col-md-5">
          <input
            className={`form-control ${darkMode ? "bg-dark text-light border-light" : ""}`} 
            placeholder="Company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </div>

        <div className="col-md-5">
          <input
            className={`form-control ${darkMode ? "bg-dark text-light border-light" : ""}`} 
            placeholder="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
        </div>

        <div className="col-md-2">
          <button className="btn btn-primary w-100">Add</button>
        </div>
      </form>

      {/* FILTER */}
      <div className="d-flex gap-3 mb-4 align-items-center flex-wrap">
        <input
          type="text"
          className={`form-control ${darkMode ? "bg-dark text-light border-light" : ""}`}
          placeholder="Search"
          style={{ flex: "2" }}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className={`form-select ${darkMode ? "bg-dark text-light border-light" : ""}`}
          style={{ width: "150px" }}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Applied">Applied</option>
          <option value="OA">OA</option>
          <option value="Interview">Interview</option>
          <option value="Rejected">Rejected</option>
        </select>

        <select
          className={`form-select ${darkMode ? "bg-dark text-light border-light" : ""}`}
          style={{ width: "150px" }}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>

        <button className="btn btn-success px-4" onClick={exportData}>
          Export
        </button>
      </div>

      <div className="row">

        {/* LEFT */}
        <div className="col-md-6">
          <h5>Application Statistics</h5>
          <BarChart width={400} height={300} data={chartData}>
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count">
              {chartData.map((_, i) => {
                const colors = ["#0d6efd", "#ffc107", "#198754", "#dc3545"];
                return <Cell key={i} fill={colors[i]} />;
              })}
            </Bar>
          </BarChart>
        </div>

        {/* RIGHT */}
        <div className="col-md-6">
          <h5>Upcoming Interviews</h5>
          {jobs
            .filter(j => j.status === "Interview" && j.interviewDate)
            .map(job => (
              <div 
                key={job._id} 
                className={`card p-2 mb-2 shadow-sm 
                  ${darkMode ? "bg-secondary text-light border-light" : ""}`}
              >
                <strong>{job.company}</strong>
                <div>{job.role}</div>
                <small>{formatDate(job.interviewDate)}</small>
              </div>
            ))}
        </div>
      </div>

      {/* JOB LIST */}
      {filteredJobs.map(job => (
        <div 
          key={job._id} 
          className={`card p-3 mt-3 shadow-sm 
            ${darkMode ? "bg-secondary text-light border-light" : ""}`}
        >
          <h5>{job.company}</h5>
          <p>{job.role}</p>

          <div className="d-flex gap-2 mt-2">
            <select value={job.status} className="form-select"
              onChange={(e) => updateStatus(job._id, e.target.value)}
            >
              <option>Applied</option>
              <option>OA</option>
              <option>Interview</option>
              <option>Rejected</option>
            </select>

            <button className="btn btn-danger" onClick={() => deleteJob(job._id)}>
              Delete
            </button>
          </div>

          {job.status === "Interview" && (
            <input
              type="date"
              className={`form-control ${darkMode ? "bg-dark text-light border-light" : ""}`}
              defaultValue={job.interviewDate?.slice(0, 10) || ""}
              onChange={(e) => updateInterviewDate(job._id, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default App;

