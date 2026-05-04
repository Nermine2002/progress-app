const express = require("express");
const app = express();

app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Calculation route (basic version)
app.post("/calculate", (req, res) => {
  const { deepWork, sleep, clean } = req.body;

  let score = 0;

  if (deepWork >= 180) score += 40;
  else if (deepWork >= 120) score += 30;
  else if (deepWork >= 60) score += 20;

  if (sleep >= 7) score += 15;

  if (clean) score += 20;

  res.json({
    score: score,
    status: score >= 60 ? "STABLE" : "CRITICAL"
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});