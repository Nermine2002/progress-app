import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

function App() {
  const [form, setForm] = useState({
    mode: 1,

    sleep_h: 23,
    sleep_m: 15,
    wake_h: 7,
    wake_m: 0,

    deep_minutes: 0,
    sport_level: 0,
    recent_intense: false,
    clean: false,

    prep: false,
    journal: false,
    dishes: false,
    hygiene: false,

    bonus_python: false,
    bonus_review: false,
    bonus_audiobook: false,
    bonus_math: false,
    bonus_politics: false,
    bonus_kegel: false,
    bonus_sauna: false,
    bonus_networking: false,
    bonus_supplements: false,

    malus_overplanning: false,
    malus_stimulation: false,
    malus_scrolling: false,
    malus_spending: false
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadHistory();
    loadAnalytics();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await axios.get("http://localhost:3001/history");
      setHistory(res.data);
    } catch (err) {
      console.error("History error:", err);
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await axios.get("http://localhost:3001/analytics");
      setAnalytics(res.data);
    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  const handleNumberChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: Number(e.target.value)
    });
  };

  const handleCheckboxChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.checked
    });
  };

  const explain = (text) => {
    alert(text);
  };

  const calculate = async () => {
    try {
      const res = await axios.post("http://localhost:3001/calculate", form);
      setResult(res.data);
      setHistory(res.data.history);
      setAnalytics(res.data.analytics);
    } catch (err) {
      console.error(err);
      alert("Backend error. Start backend with: node server.js");
    }
  };

  const resetHistory = async () => {
    try {
      await axios.delete("http://localhost:3001/history");
      setHistory([]);
      setAnalytics(null);
      setResult(null);
    } catch (err) {
      console.error(err);
      alert("Reset failed");
    }
  };

  const chartData = {
    labels: history.map((e) => e.date),
    datasets: [
      {
        label: "Score",
        data: history.map((e) => e.score),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.2)",
        tension: 0.4
      }
    ]
  };

  return (
    <div className="container">
      <h1>⚡ Identity Score</h1>
      <p className="subtitle">Measure behavior, not mood.</p>

      <div className="card">
        <h2>🧠 Daily Input</h2>

        <div className="field">
          <label>
            Mode
            <button
              className="info-btn"
              onClick={() =>
                explain(
                  "Mode changes the scoring logic. 1 = Klausurenphase, 2 = Sonntag, 3 = Frühschicht, 4 = Spätschicht, 5 = Besuch, 6 = Vorlesungszeit, 7 = Semesterferien."
                )
              }
            >
              ?
            </button>
          </label>

          <select name="mode" value={form.mode} onChange={handleNumberChange}>
            <option value={1}>1 - Klausurenphase</option>
            <option value={2}>2 - Sonntag</option>
            <option value={3}>3 - Frühschicht</option>
            <option value={4}>4 - Spätschicht</option>
            <option value={5}>5 - Besuch</option>
            <option value={6}>6 - Vorlesungszeit</option>
            <option value={7}>7 - Semesterferien</option>
          </select>
        </div>

        <div className="grid">
          <div className="field">
            <label>Sleep Hour</label>
            <input
              type="number"
              name="sleep_h"
              min="0"
              max="23"
              value={form.sleep_h}
              onChange={handleNumberChange}
            />
          </div>

          <div className="field">
            <label>Sleep Minute</label>
            <input
              type="number"
              name="sleep_m"
              min="0"
              max="59"
              value={form.sleep_m}
              onChange={handleNumberChange}
            />
          </div>

          <div className="field">
            <label>Wake Hour</label>
            <input
              type="number"
              name="wake_h"
              min="0"
              max="23"
              value={form.wake_h}
              onChange={handleNumberChange}
            />
          </div>

          <div className="field">
            <label>Wake Minute</label>
            <input
              type="number"
              name="wake_m"
              min="0"
              max="59"
              value={form.wake_m}
              onChange={handleNumberChange}
            />
          </div>
        </div>

        <div className="field">
          <label>
            Deep Work Minutes
            <button
              className="info-btn"
              onClick={() =>
                explain(
                  "Real focused work without phone, without multitasking, and with a clear task. Planning does not count."
                )
              }
            >
              ?
            </button>
          </label>

          <input
            type="number"
            name="deep_minutes"
            min="0"
            value={form.deep_minutes}
            onChange={handleNumberChange}
          />
        </div>

        <div className="field">
          <label>
            Sport Level
            <button
              className="info-btn"
              onClick={() =>
                explain(
                  "0 = no sport, 1 = stretching/light movement, 2 = intense training like gym, football, HIIT or running."
                )
              }
            >
              ?
            </button>
          </label>

          <select
            name="sport_level"
            value={form.sport_level}
            onChange={handleNumberChange}
          >
            <option value={0}>0 - Nothing</option>
            <option value={1}>1 - Light / Stretching</option>
            <option value={2}>2 - Intense</option>
          </select>
        </div>

        <label className="checkbox">
          <input
            type="checkbox"
            name="recent_intense"
            checked={form.recent_intense}
            onChange={handleCheckboxChange}
          />
          Yesterday or day before was intense training
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            name="clean"
            checked={form.clean}
            onChange={handleCheckboxChange}
          />
          Clean Day: No Vape / No Smoking
        </label>
      </div>

      <div className="card">
        <h2>🧱 Structure</h2>

        <label className="checkbox">
          <input
            type="checkbox"
            name="prep"
            checked={form.prep}
            onChange={handleCheckboxChange}
          />
          Clothes / bag / breakfast prepared
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            name="journal"
            checked={form.journal}
            onChange={handleCheckboxChange}
          />
          Tracking & Journaling
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            name="dishes"
            checked={form.dishes}
            onChange={handleCheckboxChange}
          />
          Dishes done
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            name="hygiene"
            checked={form.hygiene}
            onChange={handleCheckboxChange}
          />
          Hygiene done
        </label>
      </div>

      <div className="card">
        <h2>➕ Bonus</h2>
        <p className="small">Bonus only counts if the day is stable.</p>

        {[
          ["bonus_python", "Informatik Skill 1h"],
          ["bonus_review", "Evening Deep Work Review 1h"],
          ["bonus_audiobook", "Audiobook + NotebookLM"],
          ["bonus_math", "Math / Logic task"],
          ["bonus_politics", "Economics / Politics"],
          ["bonus_kegel", "Kegel Exercises"],
          ["bonus_sauna", "Sauna"],
          ["bonus_networking", "Networking"],
          ["bonus_supplements", "6 Supplements"]
        ].map(([name, label]) => (
          <label className="checkbox" key={name}>
            <input
              type="checkbox"
              name={name}
              checked={form[name]}
              onChange={handleCheckboxChange}
            />
            {label}
          </label>
        ))}
      </div>

      <div className="card">
        <h2>➖ Malus</h2>
        <p className="small">Each checked malus removes 3%.</p>

        {[
          ["malus_overplanning", "Overplanning / Tweaking instead of delivery"],
          ["malus_stimulation", "Dopamine overstimulation"],
          ["malus_scrolling", "Pointless scrolling / media"],
          ["malus_spending", "Impulsive spending"]
        ].map(([name, label]) => (
          <label className="checkbox danger-check" key={name}>
            <input
              type="checkbox"
              name={name}
              checked={form[name]}
              onChange={handleCheckboxChange}
            />
            {label}
          </label>
        ))}
      </div>

      <button onClick={calculate}>Calculate</button>
      <button className="reset" onClick={resetHistory}>
        Reset History
      </button>

      {result && (
        <div className="card result">
          <h2>{result.finalScore.toFixed(1)}%</h2>
          <h3 className={result.status.toLowerCase()}>{result.status}</h3>

          <p>Stable: {result.stable ? "✅ Yes" : "❌ No"}</p>
          <p>Streak: 🔥 {result.streak} days</p>
          <p>Bonus: +{result.bonus.toFixed(1)}%</p>
          <p>Malus: -{result.malus.toFixed(1)}%</p>
        </div>
      )}

      {result && result.streak > 0 && result.streak % 7 === 0 && (
        <div className="card congrats">
          <h2>🔥 CONGRATS!</h2>
          <p>You reached {result.streak} stable days.</p>
          <p>This is identity building. Keep going.</p>
        </div>
      )}

      {analytics && (
        <div className="card">
          <h2>📊 Analytics</h2>

          <div className="row">
            <span>Average 7</span>
            <span>{analytics.avg7.toFixed(1)}%</span>
          </div>

          <div className="row">
            <span>Min 7</span>
            <span>{analytics.min7.toFixed(1)}%</span>
          </div>

          <div className="row">
            <span>Average 30</span>
            <span>{analytics.avg30.toFixed(1)}%</span>
          </div>

          <div className="row">
            <span>Total Deep 7</span>
            <span>{analytics.deep7} min</span>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="card">
          <h2>📈 Score Trend</h2>
          <Line key={history.length} data={chartData} />
        </div>
      )}

      <div className="card">
        <h2>History</h2>

        {history.length === 0 && <p>No data yet</p>}

        {history.map((e, i) => (
          <div key={i} className="history-item">
            <span>{e.date}</span>
            <span>{e.score.toFixed(1)}%</span>
            <span>{e.stable ? "✅" : "❌"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;