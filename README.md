# 🚀 Progress App

A full-stack performance tracking app based on behavioral science and deep work principles.

---

## 🧠 Concept

This app is built to track real performance — not just activity.

It is based on:

* Deep Work (Cal Newport)
* Atomic Habits (James Clear)
* Behavior tracking systems

The goal is to measure:

* Focus
* Consistency
* Identity-based actions

---

## ⚙️ Tech Stack

### Frontend

* React

### Backend

* Node.js
* Express

---

## 📂 Project Structure

progress-app-root/
├── frontend/   # React application
├── backend/    # Node.js API

---

## 🚀 Features (MVP)

* Input:

  * Deep Work minutes
  * Sleep hours
  * Clean behavior (no smoking / vaping)

* Output:

  * Score calculation
  * Status: STABLE / CRITICAL

---

## 🔧 How to Run

### Frontend

```bash
cd frontend
npm install
npm start
```

Runs on:
http://localhost:3000

---

### Backend

```bash
cd backend
npm install
node server.js
```

Runs on:
http://localhost:5000

---

## 🔗 API Example

POST /calculate

```json
{
  "deepWork": 180,
  "sleep": 7,
  "clean": true
}
```

Response:

```json
{
  "score": 75,
  "status": "STABLE"
}
```

---

## 👥 Collaboration

* Git & GitHub workflow
* Feature branches
* Pull requests

---

## 🎯 Goal

Build a real-world app combining:

* Software engineering
* Behavioral science
* Performance optimization

---

## 🚧 Status

MVP in development 🚀
