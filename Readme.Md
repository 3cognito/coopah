# Coopah Run Tracking Backend

## 📌 Project Summary?

**Coopah** is a run tracking backend I built using **Koa**, with **Redis** and **PostgreSQL** databases.

## 💡 Why?

I was inspired by an interest in a role at [coopah.com](https://coopah.com). While Coopah's current app does not offer run tracking, I was curious about how that can be done, it could be a future feature for Coopah.

It is important to note that I think real time route tracking is better handled directly on the client (most likely a mobile app). Backend can store history and calculate insights in the background

## 🛠️ Tech Stack

- **Node.js**
- **Koa**
- **Redis**
- **PostgreSQL**

## ✅ Testing

- I wrote **end-to-end (e2e) tests** that simulate **real HTTP requests** to the app's endpoints, I decided against mocks because I wanted more realistic tests on a real app instance. I feel mocks are brittle.
- The test environment:
  - Spins up **Redis** and **PostgreSQL** in **Docker containers**.
  - Runs the tests against an **actual application instance** connected to these databases.

## 🔚 Final Words

I may tinker around with this project for a bit longer, but nothing major is planned.

> I enjoyed implementing the `haversineDistance` formula.

**Hire me!**  
📧 tommyubongabasijohn@gmail.com
