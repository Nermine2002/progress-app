const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   HELPER FUNCTIONS
========================= */

function sleepDuration(sleep, wake) {
  if (wake >= sleep) return wake - sleep;
  return (1440 - sleep) + wake;
}

function deepWorkScore(minutes) {
  if (minutes >= 180) return 40;
  if (minutes >= 120) return 30;
  if (minutes >= 60) return 20;
  return 0;
}

function sleepScore(duration) {
  if (duration >= 480) return 30; // 8h
  if (duration >= 420) return 20; // 7h
  if (duration >= 360) return 10; // 6h
  return 0;
}

/* =========================
   API ROUTES
========================= */

app.get("/", (req, res) => {
  res.send("Backend is alive 🚀");
});

app.post("/calculate", (req, res) => {
  try {
    console.log("Incoming:", req.body);

    const {
      sleep_h,
      sleep_m,
      wake_h,
      wake_m,
      deep_minutes
    } = req.body;

    const sleepTime = sleep_h * 60 + sleep_m;
    const wakeTime = wake_h * 60 + wake_m;

    const duration = sleepDuration(sleepTime, wakeTime);

    // 🔥 RAW SCORE
    let score = 0;

    score += deepWorkScore(deep_minutes);
    score += sleepScore(duration);

    // MAX = 70 → normalize to 100
    const finalScore = Math.min(100, (score / 70) * 100);

    // STATUS
    let status = "CRITICAL";
    if (finalScore >= 80) status = "STABLE";
    else if (finalScore >= 50) status = "FRAGILE";

    res.json({
      finalScore: finalScore,
      status: status
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: "Server crash" });
  }
});

/* ========================= */

const PORT = 3001;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});