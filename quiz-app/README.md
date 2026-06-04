# Mobile Quiz Application for Learning and Performance Tracking

Course: CEC418 Software Construction  
Student: Enokenwa Annafalon Ntui  
Matricule: CT23A052

## Project Summary

This project is a mobile-first quiz application built with HTML, CSS, JavaScript, SQLite schema design, and Capacitor support. It allows students to register, login, select quiz topics, answer timed multiple-choice questions, receive instant feedback, view results, and track performance offline.

## Features Implemented

- User registration with password hashing
- User login and logout
- Topic/category selection
- Expanded categories: Mathematics, ICT, Science, English, French, Software Construction and Quality, Computer Science, Economics, and Machine Learning
- Multiple-choice quiz questions
- Quiz countdown timer
- Question progress bar
- Instant feedback after each answer
- Score calculation and grading
- Result page with answer review
- Performance dashboard
- Leaderboard
- Dark mode and light mode
- Local offline storage
- SQLite database schema for Capacitor database integration
- Responsive mobile-first user interface

## Folder Structure

```text
quiz-app/
├── index.html
├── login.html
├── register.html
├── home.html
├── quiz.html
├── result.html
├── dashboard.html
├── css/
│   ├── style.css
│   ├── login.css
│   ├── register.css
│   ├── home.css
│   ├── quiz.css
│   ├── result.css
│   └── dashboard.css
├── js/
│   ├── auth.js
│   ├── database.js
│   ├── quiz.js
│   ├── result.js
│   ├── dashboard.js
│   └── darkmode.js
├── assets/
│   ├── images/
│   ├── icons/
│   └── sounds/
├── database/
│   └── schema.sql
├── capacitor.config.json
├── package.json
└── README.md
```

## Purpose of Main Files

- `index.html`: Landing page that introduces the project.
- `register.html`: User registration screen.
- `login.html`: User login screen.
- `home.html`: Category selection and leaderboard screen.
- `quiz.html`: Timed quiz interface.
- `result.html`: Score, grade, and answer review screen.
- `dashboard.html`: Performance tracking screen.
- `css/style.css`: Global layout, buttons, cards, forms, variables, and dark theme.
- `js/database.js`: Local database abstraction, seed data, SQLite hook, and storage operations.
- `js/auth.js`: Registration, login, logout, session protection, and password hashing.
- `js/quiz.js`: Category rendering, quiz timer, answer feedback, progress bar, and score saving.
- `js/result.js`: Result rendering and answer review.
- `js/dashboard.js`: Attempts, averages, best score, category progress, and leaderboard.
- `js/darkmode.js`: Dark mode preference and toggle behavior.
- `database/schema.sql`: SQLite database tables and indexes.

## How to Run in Browser

Open `index.html` directly in a browser, or use a local static server:

```bash
npm install
npm run serve
```

Then open:

```text
http://localhost:8080
```

## How to Run with Capacitor

Install dependencies:

```bash
npm install
```

Add Android or iOS platform:

```bash
npm run cap:add:android
npm run cap:add:ios
```

Sync the project:

```bash
npm run cap:sync
```

Open the native project:

```bash
npm run cap:open:android
npm run cap:open:ios
```

## Software Construction Explanation

The application was constructed using a simple layered structure:

- Interface layer: HTML pages define the screens used by the student.
- Styling layer: CSS files provide a responsive mobile-first design and dark mode.
- Logic layer: JavaScript files control authentication, quiz flow, scoring, results, and dashboard rendering.
- Data layer: `database.js` centralizes all data operations so page files do not directly manage storage.
- Database design: `schema.sql` defines users, categories, questions, attempts, answers, and performance summary tables.

## Data Flow

1. A student registers on `register.html`.
2. The password is hashed in `auth.js` before storage.
3. The student logs in through `login.html`.
4. The session is saved locally.
5. The student selects a category on `home.html`.
6. `quiz.js` loads questions from `database.js`.
7. The timer starts and the progress bar updates.
8. Each selected answer receives instant feedback.
9. When the quiz ends, the score, grade, duration, and answers are saved.
10. `result.html` displays the result and answer review.
11. `dashboard.html` summarizes performance history.

## Best Practices Used

- Separation of concerns between HTML, CSS, JavaScript, and database schema.
- Centralized database access through `database.js`.
- Input validation for registration and login.
- Password hashing before storage.
- Mobile-first responsive UI.
- Reusable CSS utility classes.
- Dark mode persisted across sessions.
- Offline-first design for student accessibility.
- Comments added where implementation decisions matter.

## Note About SQLite

The app includes a production-style SQLite schema in `database/schema.sql`. In a direct browser preview, the app uses localStorage as a fallback so it can be tested immediately. When packaged with Capacitor and the SQLite plugin is available, `database.js` attempts to initialize the Capacitor SQLite database using the same schema.
