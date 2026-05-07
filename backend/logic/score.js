const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/scores.json");

/* ========================= */

function sleepDuration(sleep, wake) {
  if (wake >= sleep) return wake - sleep;
  return (1440 - sleep) + wake;
}

/* ========================= */

function calculateScore(input) {
  const {
    sleep_h = 0,
    sleep_m = 0,
    wake_h = 0,
    wake_m = 0,
    deep_minutes = 0
  } = input;

  const sleepTime = sleep_h * 60 + sleep_m;
  const wakeTime = wake_h * 60 + wake_m;

  const duration = sleepDuration(sleepTime, wakeTime);

  let deep = 0;
  if (deep_minutes >= 180) deep = 40;
  else if (deep_minutes >= 120) deep = 30;
  else if (deep_minutes >= 60) deep = 20;

  let sleep = 0;
  if (duration >= 480) sleep = 30;
  else if (duration >= 420) sleep = 20;
  else if (duration >= 360) sleep = 10;

  const raw = deep + sleep;

  const finalScore = Math.min(100, (raw / 70) * 100);

  let status = "CRITICAL";
  if (finalScore >= 80) status = "STABLE";
  else if (finalScore >= 50) status = "FRAGILE";

  return {
    sections: { deepWork: deep, sleep },
    rawScore: raw,
    correctedScore: raw,
    bonus: 0,
    malus: 0,
    finalScore,
    status
  };
}

/* ========================= */

function loadHistory() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveHistory(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function addEntry(entry) {
  let data = loadHistory();
  data.push(entry);

  if (data.length > 30) data.shift();

  saveHistory(data);
  return data;
}

/* ========================= */

function computeAnalytics(days = 7) {
  const data = loadHistory().slice(-days);
  const scores = data.map(d => d.score);

  const avg =
    scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

  return {
    avg,
    min: scores.length ? Math.min(...scores) : 0,
    count: data.length
  };
}

/* ========================= */

module.exports = {
  calculateScore,
  loadHistory,
  addEntry,
  computeAnalytics
};