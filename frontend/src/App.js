import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    mode: 1,
    sleep_h: 23,
    sleep_m: 0,
    wake_h: 7,
    wake_m: 0,
    deep_minutes: 0,
    sport_type: 0,
    yesterday_intense: 0,
    before_yesterday_intense: 0,
    clean: 1,
    prep: 0,
    journal: 0,
    dishes: 0,
    hygiene: 0
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("history")) || [];
    setHistory(saved);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: Number(e.target.value) });
  };

  const calculate = async () => {
    try {
      const res = await axios.post("http://localhost:5000/calculate", form);
      setResult(res.data);

      const today = new Date().toISOString().split("T")[0];

      const newEntry = {
        date: today,
        score: res.data.finalScore,
        status: res.data.status
      };

      const old = JSON.parse(localStorage.getItem("history")) || [];
      const filtered = old.filter(e => e.date !== today);
      const updated = [...filtered, newEntry];

      localStorage.setItem("history", JSON.stringify(updated));
      setHistory(updated);

      // STREAK
      let sorted = [...updated].sort((a, b) => new Date(a.date) - new Date(b.date));
      let currentStreak = 1;

      for (let i = sorted.length - 1; i > 0; i--) {
        const d1 = new Date(sorted[i].date);
        const d2 = new Date(sorted[i - 1].date);
        const diff = (d1 - d2) / (1000 * 60 * 60 * 24);

        if (diff === 1) currentStreak++;
        else break;
      }

      setStreak(currentStreak);

    } catch (err) {
      console.error(err);
      alert("Backend error");
    }
  };

  return (
    <div className="container">
      <h1>⚡ Identity Score</h1>

      <div className="card">
        <h2>Input</h2>

        <input type="number" name="sleep_h" placeholder="Sleep Hour" onChange={handleChange}/>
        <input type="number" name="sleep_m" placeholder="Sleep Min" onChange={handleChange}/>
        <input type="number" name="wake_h" placeholder="Wake Hour" onChange={handleChange}/>
        <input type="number" name="wake_m" placeholder="Wake Min" onChange={handleChange}/>
        <input type="number" name="deep_minutes" placeholder="Deep Work Minutes" onChange={handleChange}/>

        <button onClick={calculate}>Calculate</button>
      </div>

      {result && (
        <>
          <div className="card result">
            <h2>{result.finalScore.toFixed(2)}%</h2>
            <h3>{result.status}</h3>
          </div>

          <div className="card history-container">
            <div className="streak-box">
              🔥 {streak} days

              {streak >= 7 && (
                <div className="congrats">
                  🎉 7 Day Streak! You are elite.
                </div>
              )}
            </div>

            <div className="history-title">History</div>

            {history.map((entry, index) => (
              <div
                key={index}
                className={`history-item ${entry.status.toLowerCase()}`}
              >
                <div>{entry.date}</div>
                <div>{entry.score.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;