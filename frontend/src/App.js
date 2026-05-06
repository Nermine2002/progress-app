import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    sleep_h: 23,
    sleep_m: 0,
    wake_h: 7,
    wake_m: 0,
    deep_minutes: 0
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(0);

  // LOAD HISTORY
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("history")) || [];
    setHistory(saved);
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: Number(e.target.value)
    });
  };

  const calculate = async () => {
    try {
      const res = await axios.post("http://localhost:3001/calculate", form);
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

      // 🔥 STREAK LOGIC (>=80%)
      let sorted = [...updated].sort((a, b) => new Date(a.date) - new Date(b.date));
      let currentStreak = 0;

      for (let i = sorted.length - 1; i >= 0; i--) {
        if (sorted[i].score >= 80) currentStreak++;
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
        <input type="number" name="sleep_h" placeholder="Sleep Hour" onChange={handleChange}/>
        <input type="number" name="sleep_m" placeholder="Sleep Min" onChange={handleChange}/>
        <input type="number" name="wake_h" placeholder="Wake Hour" onChange={handleChange}/>
        <input type="number" name="wake_m" placeholder="Wake Min" onChange={handleChange}/>
        <input type="number" name="deep_minutes" placeholder="Deep Work" onChange={handleChange}/>

        <button onClick={calculate}>Calculate</button>
      </div>

      {result && (
        <>
          <div className="card result">
            <h2>{result.finalScore.toFixed(1)}%</h2>
            <h3 className={result.status.toLowerCase()}>
              {result.status}
            </h3>
          </div>

          <div className="card">
            <div className="streak">
              🔥 {streak} days streak
            </div>

            {streak >= 7 && (
              <div className="celebration">
                🎉 You hit 7 days above 80%! Elite discipline!
              </div>
            )}

            <h3>History</h3>

            {history.map((entry, index) => (
              <div key={index} className="history-item">
                <span>{entry.date}</span>
                <span>{entry.score.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;