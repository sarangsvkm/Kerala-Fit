# Kerala Fit 🌴💪

> **Culturally Contextualized Health, Nutrition & Fitness Management Platform for Kerala**

Kerala Fit is a full-stack mobile application tailored specifically to the dietary habits, lifestyle, and health needs of individuals in Kerala and the global Malayali community.

---

## 📑 Project Documentation

- **Comprehensive Project Plan & Architecture (English):** [PROJECT_PLAN.md](file:///e:/Kerala%20Fit/PROJECT_PLAN.md)
- **പ്രൊജക്റ്റ് പ്ലാൻ & സാങ്കേതിക രൂപരേഖ (മലയാളം):** [PROJECT_PLAN_ML.md](file:///e:/Kerala%20Fit/PROJECT_PLAN_ML.md)
- **Agent Guidelines & Expo Rules:** [AGENTS.md](file:///e:/Kerala%20Fit/AGENTS.md)

---

## 🚀 Key Features

- **Kerala Food & Calorie Tracker:** Pre-loaded with iconic Malayali dishes (Idli, Appam, Puttu, Kadala Curry, Aviyal, Fish Curry, Beef Fry, Al Faham, Mandi, Biryani) with meal categorization and custom calorie logging.
- **Dynamic Vitals Dashboard:** 4-ring SVG progress tracker for Calories, Hydration (3,000 ml target), Steps (8,000 steps target), and Sleep duration.
- **Vital Trackers:**
  - Water Tracker with quick-add increments and regional tips (*Jeeraka Vellam*).
  - Sleep Quality Analyzer with deep sleep ratio and composite sleep scoring.
  - Weight & BMI Tracker with Bézier curve trend graphs.
  - Pedometer Step Tracker with distance and active burn calculations.
- **Interactive Workout Engine:** Structured routines for Walking, Yoga/Surya Namaskar, HIIT Weight Loss, and Six-Pack Core with an interactive interval timer.
- **AI Malayali Coach:** Regional dietary recommendations, healthier recipe alternatives, and festival/Sadhya portion guides.
- **Weekly PDF Health Audits:** Server-side PDF generation using JasperReports and OpenPDF.

---

## 🛠️ Tech Stack

### Mobile App (Frontend)
- **Framework:** [Expo](https://docs.expo.dev/versions/v56.0.0/) SDK ~56.0.11 / React Native 0.85.3
- **Language:** TypeScript 6.0.3
- **Icons:** Lucide React Native
- **Storage:** React Native AsyncStorage

### Backend Service (REST API)
- **Framework:** Spring Boot 3.3.0 / Java 21 (LTS)
- **Database:** PostgreSQL 16
- **Security:** Spring Security + Stateless JWT Authentication (jjwt 0.12.5)
- **Reporting Engine:** JasperReports 6.20.0 + OpenPDF

---

## 🏃 Getting Started

### 1. Mobile Client Setup
```bash
# Install dependencies
npm install

# Start Expo development server
npm start
```

### 2. Backend Service Setup
Ensure PostgreSQL is running with database `keralafit_db`.
```bash
cd backend

# Run Spring Boot service
./mvnw spring-boot:run
# or
mvn spring-boot:run
```
Service runs on `http://localhost:8080`.
