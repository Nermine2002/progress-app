const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "history.json");

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    return {
      history: [],
      streak: 0
    };
  }

  const raw = fs.readFileSync(DATA_FILE, "utf8");

  if (!raw) {
    return {
      history: [],
      streak: 0
    };
  }

  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function timeToMinutes(h, m) {
  return h * 60 + m;
}

function cyclicDiff(a, b) {
  const diff = Math.abs(a - b);
  return Math.min(diff, 1440 - diff);
}

function sleepDuration(sleepMin, wakeMin) {
  if (wakeMin < sleepMin) {
    return 1440 - sleepMin + wakeMin;
  }

  return wakeMin - sleepMin;
}

function sleepWakeScore(mode, sleepMin, wakeMin) {
  if (mode === 5) {
    return wakeMin <= 10 * 60 ? 15 : 0;
  }

  let sleepOpt = 23 * 60 + 15;
  let wakeOpt = 7 * 60;
  let durationOpt = 7 * 60 + 45;
  let tolerance = 180;

  if (mode === 2 || mode === 7) {
    tolerance = 240;
  }

  if (mode === 3) {
    sleepOpt = 22 * 60 + 15;
    wakeOpt = 4 * 60 + 30;
    durationOpt = 6 * 60;
    tolerance = 180;
  }

  const duration = sleepDuration(sleepMin, wakeMin);

  const diffDuration = Math.abs(duration - durationOpt);
  const diffSleep = cyclicDiff(sleepMin, sleepOpt);
  const diffWake = cyclicDiff(wakeMin, wakeOpt);

  const SD = clamp(1 - diffDuration / tolerance, 0, 1);
  const SR = clamp(1 - diffSleep / tolerance, 0, 1);
  const SW = clamp(1 - diffWake / tolerance, 0, 1);

  const scaled = 0.5 * SD + 0.25 * SR + 0.25 * SW;

  const maxPoints = mode === 1 ? 7 : 15;

  return maxPoints * scaled;
}

function deepWorkScore(mode, minutes) {
  if (mode === 1) {
    return clamp((minutes / 360) * 60, 0, 60);
  }

  if (mode === 3) {
    if (minutes >= 120) return 37;
    if (minutes >= 90) return 27;
    if (minutes >= 60) return 17;
    return 0;
  }

  if (mode === 4) {
    if (minutes >= 120) return 42;
    if (minutes >= 90) return 32;
    if (minutes >= 60) return 22;
    if (minutes >= 30) return 12;
    return 0;
  }

  return (minutes / 360) * 42;
}

function sportScore(mode, sportLevel, recentIntense) {
  if (sportLevel === 0) return 0;

  if (mode === 1) {
    if (sportLevel === 2) return 12;
    return recentIntense ? 12 : 6;
  }

  if (mode === 3 || mode === 5) {
    return 15;
  }

  if (sportLevel === 2) return 15;

  return recentIntense ? 15 : 7.5;
}

function cleanScore(mode, clean) {
  if (!clean) return 0;
  return mode === 1 ? 15 : 18;
}

function structureScore(mode, form) {
  let valuePerItem = mode === 1 ? 1.5 : 2.5;

  let score = 0;

  if (form.prep) score += valuePerItem;
  if (form.journal) score += valuePerItem;
  if (form.dishes) score += valuePerItem;
  if (form.hygiene) score += valuePerItem;

  return score;
}

function correctionFactor(mode, deepMinutes) {
  if (mode === 3 || mode === 4) return 1.0;

  if (deepMinutes === 0) return 0.6;
  if (deepMinutes <= 60) return 0.7;
  if (deepMinutes <= 120) return 0.8;
  if (deepMinutes <= 180) return 0.9;
  if (deepMinutes <= 240) return 1.0;
  if (deepMinutes <= 300) return 1.05;

  return 1.1;
}

function bonusScore(form, stable) {
  if (!stable) return 0;

  let bonus = 0;

  if (form.bonus_python) bonus += 5;
  if (form.bonus_review) bonus += 5;
  if (form.bonus_audiobook) bonus += 5;
  if (form.bonus_math) bonus += 5;
  if (form.bonus_politics) bonus += 3;
  if (form.bonus_kegel) bonus += 3;
  if (form.bonus_sauna) bonus += 3;
  if (form.bonus_networking) bonus += 3;
  if (form.bonus_supplements) bonus += 1;

  return Math.min(bonus, 10);
}

function malusScore(form) {
  let malus = 0;

  if (form.malus_overplanning) malus += 3;
  if (form.malus_stimulation) malus += 3;
  if (form.malus_scrolling) malus += 3;
  if (form.malus_spending) malus += 3;

  return malus;
}

function getStatus(score, stable) {
  if (stable && score >= 80) return "STABLE";
  if (stable) return "STABLE";
  return "UNSTABLE";
}

function calculateAnalytics(history) {
  const last7 = history.slice(-7);
  const last30 = history.slice(-30);

  const avg = (arr) => {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, e) => sum + e.score, 0) / arr.length;
  };

  const min = (arr) => {
    if (arr.length === 0) return 0;
    return Math.min(...arr.map((e) => e.score));
  };

  const deepSum = (arr) => {
    return arr.reduce((sum, e) => sum + e.deep_minutes, 0);
  };

  return {
    avg7: avg(last7),
    min7: min(last7),
    avg30: avg(last30),
    min30: min(last30),
    deep7: deepSum(last7),
    deep30: deepSum(last30),
    count: history.length
  };
}

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.get("/history", (req, res) => {
  const data = readData();
  res.json(data.history);
});

app.get("/analytics", (req, res) => {
  const data = readData();
  res.json(calculateAnalytics(data.history));
});

app.post("/calculate", (req, res) => {
  const form = req.body;

  const mode = Number(form.mode);

  const sleepMin = timeToMinutes(Number(form.sleep_h), Number(form.sleep_m));
  const wakeMin = timeToMinutes(Number(form.wake_h), Number(form.wake_m));
  const deepMinutes = Number(form.deep_minutes);

  const cpDeep = deepWorkScore(mode, deepMinutes);
  const cpSleepWake = sleepWakeScore(mode, sleepMin, wakeMin);
  const cpSport = sportScore(
    mode,
    Number(form.sport_level),
    Boolean(form.recent_intense)
  );
  const cpClean = cleanScore(mode, Boolean(form.clean));
  const cpStructure = structureScore(mode, form);

  const rawScore = cpDeep + cpSleepWake + cpSport + cpClean + cpStructure;

  const factor = correctionFactor(mode, deepMinutes);
  const correctedScore = rawScore * factor;

  const stable =
    Boolean(form.clean) &&
    correctedScore >= 60 &&
    deepMinutes >= 60;

  const bonus = bonusScore(form, stable);
  const malus = malusScore(form);

  let finalScore = correctedScore + bonus - malus;

  if (finalScore < 0) finalScore = 0;

  const data = readData();

  let newStreak;

  if (stable) {
    newStreak = data.streak + 1;
  } else {
    newStreak = Math.floor(data.streak / 2);
  }

  const today = new Date().toISOString().slice(0, 10);

  const entry = {
    date: today,
    score: finalScore,
    rawScore,
    correctedScore,
    factor,
    stable,
    streak: newStreak,
    deep_minutes: deepMinutes
  };

  const newHistory = [...data.history, entry].slice(-30);

  const newData = {
    history: newHistory,
    streak: newStreak
  };

  writeData(newData);

  const analytics = calculateAnalytics(newHistory);

  res.json({
    finalScore,
    rawScore,
    correctedScore,
    factor,
    status: getStatus(finalScore, stable),
    stable,
    streak: newStreak,
    bonus,
    malus,
    history: newHistory,
    analytics
  });
});

app.delete("/history", (req, res) => {
  const emptyData = {
    history: [],
    streak: 0
  };

  writeData(emptyData);

  res.json({
    message: "History reset"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});