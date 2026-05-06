const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   HELPERS
========================= */

const safe = (v) => Number(v) || 0;

function timeToMinutes(h, m) {
  return h * 60 + m;
}

function diffMinutesClock(a, b) {
  let diff = Math.abs(a - b);
  if (diff > 720) diff = 1440 - diff;
  return diff;
}

function sleepDuration(sleep, wake) {
  if (wake >= sleep) return wake - sleep;
  return (1440 - sleep) + wake;
}

function clampMin(value, min) {
  return value < min ? min : value;
}

/* =========================
   SLEEP SCORE
========================= */

function calculateSleepScore(
  sleepTime,
  wakeTime,
  idealSleep,
  idealWake,
  idealDuration,
  tolerance,
  maxPoints
) {
  const duration = sleepDuration(sleepTime, wakeTime);

  const diffD = Math.abs(duration - idealDuration);
  const diffSleep = diffMinutesClock(sleepTime, idealSleep);
  const diffWake = diffMinutesClock(wakeTime, idealWake);

  const SD = clampMin(1000 - (diffD * 1000) / tolerance, 0);
  const SR = clampMin(1000 - (diffSleep * 1000) / tolerance, 0);
  const SW = clampMin(1000 - (diffWake * 1000) / tolerance, 0);

  const scaled = 0.5 * SD + 0.25 * SR + 0.25 * SW;

  return (maxPoints * scaled) / 1000;
}

/* =========================
   DEEP WORK
========================= */

function deepWorkScore(mode, minutes, activeEvents, passiveEvents) {
  minutes = safe(minutes);

  if (mode === 1) return (minutes / 60) * 10;

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

  if (mode === 6) {
    const blockPoints = (minutes / 60) * 7;
    const eventPoints = safe(activeEvents) * 8 + safe(passiveEvents) * 3;
    return blockPoints + eventPoints;
  }

  return (minutes / 60) * 7;
}

/* =========================
   CORRECTION
========================= */

function correctionFactor(mode, minutes) {
  minutes = safe(minutes);

  if ([3, 4, 7].includes(mode)) return 1.0;

  if (minutes === 0) return 0.6;
  if (minutes <= 60) return 0.7;
  if (minutes <= 120) return 0.8;
  if (minutes <= 180) return 0.9;
  if (minutes <= 240) return 1.0;
  if (minutes <= 300) return 1.05;

  return 1.1;
}

/* =========================
   API
========================= */

app.post("/calculate", (req, res) => {
  try {
    console.log("Incoming:", req.body);

    const {
      mode,
      sleep_h,
      sleep_m,
      wake_h,
      wake_m,
      deep_minutes,
      sport_type,
      yesterday_intense,
      before_yesterday_intense,
      clean,
      prep,
      journal,
      dishes,
      hygiene,
      active_events = 0,
      passive_events = 0
    } = req.body;

    const sleepTime = timeToMinutes(safe(sleep_h), safe(sleep_m));
    const wakeTime = timeToMinutes(safe(wake_h), safe(wake_m));

    let idealSleep, idealWake, idealDuration, tolerance, sleepMax;

    if (mode === 3) {
      idealSleep = timeToMinutes(22, 15);
      idealWake = timeToMinutes(4, 30);
      idealDuration = 360;
      tolerance = 180;
      sleepMax = 15;
    } else {
      idealSleep = timeToMinutes(23, 15);
      idealWake = timeToMinutes(7, 0);
      idealDuration = 465;

      tolerance = (mode === 2 || mode === 7) ? 240 : 180;
      sleepMax = (mode === 1) ? 7 : 15;
    }

    let sleepPoints;

    if (mode === 5) {
      sleepPoints = wakeTime <= timeToMinutes(10, 0) ? 15 : 0;
    } else {
      sleepPoints = calculateSleepScore(
        sleepTime,
        wakeTime,
        idealSleep,
        idealWake,
        idealDuration,
        tolerance,
        sleepMax
      );
    }

    const deepPoints = deepWorkScore(mode, deep_minutes, active_events, passive_events);

    let sportPoints = 0;

    if (mode === 1) {
      if (sport_type === 2) sportPoints = 12;
      else if (sport_type === 1) {
        sportPoints = (yesterday_intense || before_yesterday_intense) ? 12 : 6;
      }
    } else if (mode === 3 || mode === 5) {
      if (sport_type >= 1) sportPoints = 15;
    } else {
      if (sport_type === 2) sportPoints = 15;
      else if (sport_type === 1) {
        sportPoints = (yesterday_intense || before_yesterday_intense) ? 15 : 7.5;
      }
    }

    const cleanPoints = (mode === 1)
      ? (clean ? 15 : 0)
      : (clean ? 18 : 0);

    const structureUnit = (mode === 1) ? 1.5 : 2.5;

    const structurePoints =
      (prep ? structureUnit : 0) +
      (journal ? structureUnit : 0) +
      (dishes ? structureUnit : 0) +
      (hygiene ? structureUnit : 0);

    const rawScore = deepPoints + sleepPoints + sportPoints + cleanPoints + structurePoints;

    const factor = correctionFactor(mode, deep_minutes);
    const correctedScore = rawScore * factor;

    const stable = clean && correctedScore >= 60 && safe(deep_minutes) >= 60;

    res.json({
      finalScore: correctedScore,
      status: stable ? "STABLE" : correctedScore >= 40 ? "FRAGILE" : "CRITICAL"
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: "Server crash" });
  }
});

/* ========================= */

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});