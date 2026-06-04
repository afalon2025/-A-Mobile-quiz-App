(function () {
  'use strict';

  const DATABASE_NAME = 'mobile_quiz_app';
  const STORAGE_KEYS = {
    users: 'quizApp.users',
    categories: 'quizApp.categories',
    questions: 'quizApp.questions',
    attempts: 'quizApp.attempts',
    session: 'quizApp.session'
  };

  // This schema is also stored in database/schema.sql for documentation and migration use.
  const SQL_SCHEMA = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      question TEXT NOT NULL,
      options_json TEXT NOT NULL,
      answer_index INTEGER NOT NULL,
      explanation TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      category_name TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      percentage INTEGER NOT NULL,
      grade TEXT NOT NULL,
      duration_seconds INTEGER NOT NULL,
      status TEXT NOT NULL,
      answers_json TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS quiz_answers (
      id TEXT PRIMARY KEY,
      attempt_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      selected_index INTEGER,
      correct_index INTEGER NOT NULL,
      is_correct INTEGER NOT NULL,
      FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );
  `;

  const DEFAULT_CATEGORIES = [
    {
      id: 'math',
      name: 'Mathematics',
      description: 'Practice calculations, percentages, and basic problem solving.',
      color: '#2563eb'
    },
    {
      id: 'ict',
      name: 'ICT',
      description: 'Review computer fundamentals, internet concepts, and software tools.',
      color: '#7c3aed'
    },
    {
      id: 'science',
      name: 'Science',
      description: 'Test knowledge of biology, physics, chemistry, and everyday science.',
      color: '#16a34a'
    },
    {
      id: 'english',
      name: 'English',
      description: 'Improve grammar, vocabulary, sentence structure, and reading skills.',
      color: '#ea580c'
    },
    {
      id: 'french',
      name: 'French',
      description: 'Practice basic French vocabulary, expressions, articles, and translation.',
      color: '#0891b2'
    },
    {
      id: 'software-construction',
      name: 'Software Construction and Quality',
      description: 'Review coding, testing, debugging, integration, and software quality practices.',
      color: '#9333ea'
    },
    {
      id: 'computer-science',
      name: 'Computer Science',
      description: 'Learn algorithms, data structures, programming concepts, and computing basics.',
      color: '#0f766e'
    },
    {
      id: 'economics',
      name: 'Economics',
      description: 'Study demand, supply, scarcity, inflation, and basic economic decisions.',
      color: '#ca8a04'
    },
    {
      id: 'machine-learning',
      name: 'Machine Learning',
      description: 'Understand models, training data, prediction, classification, and evaluation.',
      color: '#db2777'
    }
  ];

  const DEFAULT_QUESTIONS = [
    {
      id: 'math-1',
      categoryId: 'math',
      question: 'What is 25 percent of 200?',
      options: ['25', '40', '50', '75'],
      answerIndex: 2,
      explanation: '25 percent of 200 is 0.25 multiplied by 200, which equals 50.'
    },
    {
      id: 'math-2',
      categoryId: 'math',
      question: 'If x + 7 = 15, what is x?',
      options: ['6', '7', '8', '9'],
      answerIndex: 2,
      explanation: 'Subtract 7 from both sides: x equals 8.'
    },
    {
      id: 'math-3',
      categoryId: 'math',
      question: 'What is the area of a rectangle with length 8 cm and width 5 cm?',
      options: ['13 cm2', '30 cm2', '40 cm2', '80 cm2'],
      answerIndex: 2,
      explanation: 'Area of a rectangle is length multiplied by width: 8 x 5 = 40 cm2.'
    },
    {
      id: 'math-4',
      categoryId: 'math',
      question: 'Which number is a prime number?',
      options: ['21', '27', '29', '35'],
      answerIndex: 2,
      explanation: '29 has only two factors: 1 and 29.'
    },
    {
      id: 'ict-1',
      categoryId: 'ict',
      question: 'Which device is used to input text into a computer?',
      options: ['Monitor', 'Keyboard', 'Printer', 'Speaker'],
      answerIndex: 1,
      explanation: 'A keyboard is an input device used for entering text and commands.'
    },
    {
      id: 'ict-2',
      categoryId: 'ict',
      question: 'What does CPU stand for?',
      options: ['Central Processing Unit', 'Computer Power Unit', 'Central Program Utility', 'Control Processing User'],
      answerIndex: 0,
      explanation: 'CPU means Central Processing Unit, the main processor of a computer.'
    },
    {
      id: 'ict-3',
      categoryId: 'ict',
      question: 'Which file extension is commonly used for web pages?',
      options: ['.docx', '.html', '.mp3', '.png'],
      answerIndex: 1,
      explanation: 'HTML files are used to structure web pages.'
    },
    {
      id: 'ict-4',
      categoryId: 'ict',
      question: 'Which of these is an example of system software?',
      options: ['Operating system', 'Spreadsheet', 'Presentation app', 'Web browser'],
      answerIndex: 0,
      explanation: 'An operating system manages computer hardware and software resources.'
    },
    {
      id: 'science-1',
      categoryId: 'science',
      question: 'Which organ pumps blood around the human body?',
      options: ['Lungs', 'Heart', 'Kidney', 'Brain'],
      answerIndex: 1,
      explanation: 'The heart pumps blood through the circulatory system.'
    },
    {
      id: 'science-2',
      categoryId: 'science',
      question: 'What is the process by which plants make food?',
      options: ['Respiration', 'Digestion', 'Photosynthesis', 'Evaporation'],
      answerIndex: 2,
      explanation: 'Photosynthesis allows green plants to make food using sunlight.'
    },
    {
      id: 'science-3',
      categoryId: 'science',
      question: 'Which state of matter has a fixed shape and fixed volume?',
      options: ['Solid', 'Liquid', 'Gas', 'Plasma'],
      answerIndex: 0,
      explanation: 'Solids keep both their shape and volume under normal conditions.'
    },
    {
      id: 'science-4',
      categoryId: 'science',
      question: 'Which gas do humans need for breathing?',
      options: ['Carbon dioxide', 'Nitrogen', 'Oxygen', 'Hydrogen'],
      answerIndex: 2,
      explanation: 'Humans need oxygen for respiration.'
    },
    {
      id: 'english-1',
      categoryId: 'english',
      question: 'Which word is a noun?',
      options: ['Quickly', 'Teacher', 'Run', 'Blue'],
      answerIndex: 1,
      explanation: 'Teacher is a noun because it names a person.'
    },
    {
      id: 'english-2',
      categoryId: 'english',
      question: 'Which sentence is grammatically correct?',
      options: ['She are reading a book.', 'She is reading a book.', 'She were reading a book.', 'She am reading a book.'],
      answerIndex: 1,
      explanation: 'The subject she agrees with the verb is.'
    },
    {
      id: 'english-3',
      categoryId: 'english',
      question: 'What is a synonym of happy?',
      options: ['Sad', 'Angry', 'Joyful', 'Tired'],
      answerIndex: 2,
      explanation: 'Joyful has a similar meaning to happy.'
    },
    {
      id: 'english-4',
      categoryId: 'english',
      question: 'What is the past tense of go?',
      options: ['Goed', 'Gone', 'Went', 'Going'],
      answerIndex: 2,
      explanation: 'Went is the simple past tense of go.'
    },
    {
      id: 'french-1',
      categoryId: 'french',
      question: 'What does bonjour mean in English?',
      options: ['Goodbye', 'Hello', 'Please', 'Thank you'],
      answerIndex: 1,
      explanation: 'Bonjour is a common French greeting meaning hello.'
    },
    {
      id: 'french-2',
      categoryId: 'french',
      question: 'How do you say thank you in French?',
      options: ['Merci', 'Bonsoir', 'Pardon', 'Salut'],
      answerIndex: 0,
      explanation: 'Merci means thank you in French.'
    },
    {
      id: 'french-3',
      categoryId: 'french',
      question: 'Which article is commonly used with livre?',
      options: ['La', 'Le', 'Les', 'Une'],
      answerIndex: 1,
      explanation: 'Livre is masculine singular, so le livre is correct.'
    },
    {
      id: 'french-4',
      categoryId: 'french',
      question: 'What does je suis etudiant mean?',
      options: ['I am a student', 'I have a book', 'I am hungry', 'I live here'],
      answerIndex: 0,
      explanation: 'Je suis etudiant means I am a student.'
    },
    {
      id: 'software-construction-1',
      categoryId: 'software-construction',
      question: 'Which activity is part of software construction?',
      options: ['Coding and debugging', 'Only marketing', 'Buying hardware', 'Printing manuals'],
      answerIndex: 0,
      explanation: 'Software construction includes coding, testing, debugging, and integration.'
    },
    {
      id: 'software-construction-2',
      categoryId: 'software-construction',
      question: 'What does unit testing mainly verify?',
      options: ['The whole company', 'Individual components', 'Office equipment', 'Internet speed'],
      answerIndex: 1,
      explanation: 'Unit testing checks small individual units of code.'
    },
    {
      id: 'software-construction-3',
      categoryId: 'software-construction',
      question: 'Why is version control important?',
      options: ['It tracks and manages code changes', 'It deletes all bugs automatically', 'It replaces testing', 'It writes documentation alone'],
      answerIndex: 0,
      explanation: 'Version control records code history and supports collaboration.'
    },
    {
      id: 'software-construction-4',
      categoryId: 'software-construction',
      question: 'What is a major benefit of code review?',
      options: ['Improved code quality', 'Slower typing speed', 'Less communication', 'Removing all requirements'],
      answerIndex: 0,
      explanation: 'Code review helps find defects and improve maintainability.'
    },
    {
      id: 'computer-science-1',
      categoryId: 'computer-science',
      question: 'What is an algorithm?',
      options: ['A step-by-step solution to a problem', 'A computer screen', 'A type of keyboard', 'A music file'],
      answerIndex: 0,
      explanation: 'An algorithm is a clear sequence of steps used to solve a problem.'
    },
    {
      id: 'computer-science-2',
      categoryId: 'computer-science',
      question: 'Which data structure follows first in, first out?',
      options: ['Stack', 'Queue', 'Tree', 'Graph'],
      answerIndex: 1,
      explanation: 'A queue removes items in the same order they were added.'
    },
    {
      id: 'computer-science-3',
      categoryId: 'computer-science',
      question: 'A binary digit can have which values?',
      options: ['0 and 1', '1 and 2', 'A and B', '9 and 10'],
      answerIndex: 0,
      explanation: 'Binary uses two digits: 0 and 1.'
    },
    {
      id: 'computer-science-4',
      categoryId: 'computer-science',
      question: 'In object-oriented programming, what is a class?',
      options: ['A blueprint for objects', 'A database row only', 'A network cable', 'A browser tab'],
      answerIndex: 0,
      explanation: 'A class defines the structure and behavior used to create objects.'
    },
    {
      id: 'economics-1',
      categoryId: 'economics',
      question: 'According to the law of demand, what usually happens when price rises?',
      options: ['Quantity demanded falls', 'Quantity demanded always doubles', 'Demand disappears forever', 'Supply becomes zero'],
      answerIndex: 0,
      explanation: 'When price rises, consumers usually demand less of a good.'
    },
    {
      id: 'economics-2',
      categoryId: 'economics',
      question: 'What is inflation?',
      options: ['A general rise in prices', 'A fall in population', 'A type of tax form', 'A computer virus'],
      answerIndex: 0,
      explanation: 'Inflation is a general increase in the price level over time.'
    },
    {
      id: 'economics-3',
      categoryId: 'economics',
      question: 'What is opportunity cost?',
      options: ['The next best alternative forgone', 'The price of every product', 'Only money saved in a bank', 'Government income only'],
      answerIndex: 0,
      explanation: 'Opportunity cost is the value of the next best choice given up.'
    },
    {
      id: 'economics-4',
      categoryId: 'economics',
      question: 'Why do people make economic choices?',
      options: ['Resources are scarce', 'Everything is free', 'Needs never change', 'Money has no value'],
      answerIndex: 0,
      explanation: 'Economic choices are necessary because resources are limited.'
    },
    {
      id: 'machine-learning-1',
      categoryId: 'machine-learning',
      question: 'What type of data is used in supervised learning?',
      options: ['Labeled data', 'Only empty data', 'Random colors', 'No examples'],
      answerIndex: 0,
      explanation: 'Supervised learning uses labeled examples to train a model.'
    },
    {
      id: 'machine-learning-2',
      categoryId: 'machine-learning',
      question: 'Why do we use a test set?',
      options: ['To evaluate performance on unseen data', 'To delete training data', 'To make the app slower', 'To replace the model'],
      answerIndex: 0,
      explanation: 'A test set checks how well the model performs on data it has not seen.'
    },
    {
      id: 'machine-learning-3',
      categoryId: 'machine-learning',
      question: 'What is overfitting?',
      options: ['Doing well on training data but poorly on new data', 'Never training a model', 'Using no features', 'Reducing all data to zero'],
      answerIndex: 0,
      explanation: 'Overfitting means the model memorizes training data and fails to generalize.'
    },
    {
      id: 'machine-learning-4',
      categoryId: 'machine-learning',
      question: 'What does a classification model predict?',
      options: ['Categories or classes', 'Only weather temperature', 'Database passwords', 'Screen brightness'],
      answerIndex: 0,
      explanation: 'Classification predicts a category, such as pass or fail.'
    }
  ];

  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.warn('Could not parse stored data.', error);
      return fallback;
    }
  }

  function readLocal(key, fallback) {
    return safeParse(localStorage.getItem(key), fallback);
  }

  function writeLocal(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function mergeById(existingItems, defaultItems) {
    const existingIds = new Set(existingItems.map((item) => item.id));
    const missingItems = defaultItems.filter((item) => !existingIds.has(item.id));
    return [...existingItems, ...missingItems];
  }

  function createId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function now() {
    return new Date().toISOString();
  }

  function normalizeUser(row) {
    if (!row) return null;
    return {
      id: row.id,
      fullName: row.full_name || row.fullName,
      email: row.email,
      passwordHash: row.password_hash || row.passwordHash,
      createdAt: row.created_at || row.createdAt
    };
  }

  function normalizeCategory(row) {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color
    };
  }

  function normalizeQuestion(row) {
    return {
      id: row.id,
      categoryId: row.category_id || row.categoryId,
      question: row.question,
      options: typeof row.options_json === 'string' ? JSON.parse(row.options_json) : row.options,
      answerIndex: Number(row.answer_index ?? row.answerIndex),
      explanation: row.explanation
    };
  }

  function normalizeAttempt(row) {
    return {
      id: row.id,
      userId: row.user_id || row.userId,
      categoryId: row.category_id || row.categoryId,
      categoryName: row.category_name || row.categoryName,
      score: Number(row.score),
      totalQuestions: Number(row.total_questions ?? row.totalQuestions),
      percentage: Number(row.percentage),
      grade: row.grade,
      durationSeconds: Number(row.duration_seconds ?? row.durationSeconds),
      status: row.status,
      answers: typeof row.answers_json === 'string' ? JSON.parse(row.answers_json) : row.answers,
      completedAt: row.completed_at || row.completedAt
    };
  }

  const QuizDB = {
    initialized: false,
    engine: 'localStorage',
    sqlite: null,

    async init() {
      if (this.initialized) return;

      const sqliteReady = await this.initSQLite();
      if (!sqliteReady) {
        this.engine = 'localStorage';
        this.seedLocalData();
      }

      this.initialized = true;
    },

    async initSQLite() {
      const plugin = window.Capacitor?.Plugins?.CapacitorSQLite;
      if (!plugin || typeof plugin.createConnection !== 'function') return false;

      try {
        this.sqlite = plugin;
        await plugin.createConnection({ database: DATABASE_NAME, version: 1, encrypted: false, mode: 'no-encryption' });
        await plugin.open({ database: DATABASE_NAME });
        await plugin.execute({ database: DATABASE_NAME, statements: SQL_SCHEMA });
        this.engine = 'sqlite';
        await this.seedSQLiteData();
        return true;
      } catch (error) {
        console.warn('SQLite plugin unavailable. Falling back to localStorage.', error);
        this.sqlite = null;
        return false;
      }
    },

    async run(statement, values = []) {
      return this.sqlite.run({ database: DATABASE_NAME, statement, values });
    },

    async query(statement, values = []) {
      const result = await this.sqlite.query({ database: DATABASE_NAME, statement, values });
      return result.values || [];
    },

    seedLocalData() {
      writeLocal(STORAGE_KEYS.categories, mergeById(readLocal(STORAGE_KEYS.categories, []), DEFAULT_CATEGORIES));
      writeLocal(STORAGE_KEYS.questions, mergeById(readLocal(STORAGE_KEYS.questions, []), DEFAULT_QUESTIONS));

      if (!localStorage.getItem(STORAGE_KEYS.users)) {
        writeLocal(STORAGE_KEYS.users, []);
      }

      if (!localStorage.getItem(STORAGE_KEYS.attempts)) {
        writeLocal(STORAGE_KEYS.attempts, []);
      }
    },

    async seedSQLiteData() {
      for (const category of DEFAULT_CATEGORIES) {
        await this.run('INSERT OR IGNORE INTO categories (id, name, description, color) VALUES (?, ?, ?, ?)', [
          category.id,
          category.name,
          category.description,
          category.color
        ]);
      }

      for (const question of DEFAULT_QUESTIONS) {
        await this.run(
          'INSERT OR IGNORE INTO questions (id, category_id, question, options_json, answer_index, explanation) VALUES (?, ?, ?, ?, ?, ?)',
          [question.id, question.categoryId, question.question, JSON.stringify(question.options), question.answerIndex, question.explanation]
        );
      }
    },

    async createUser({ fullName, email, passwordHash }) {
      await this.init();
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await this.findUserByEmail(normalizedEmail);
      if (existingUser) {
        throw new Error('An account with this email already exists.');
      }

      const user = {
        id: createId('user'),
        fullName: fullName.trim(),
        email: normalizedEmail,
        passwordHash,
        createdAt: now()
      };

      if (this.engine === 'sqlite') {
        await this.run('INSERT INTO users (id, full_name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)', [
          user.id,
          user.fullName,
          user.email,
          user.passwordHash,
          user.createdAt
        ]);
      } else {
        const users = readLocal(STORAGE_KEYS.users, []);
        users.push(user);
        writeLocal(STORAGE_KEYS.users, users);
      }

      return user;
    },

    async findUserByEmail(email) {
      await this.init();
      const normalizedEmail = email.trim().toLowerCase();

      if (this.engine === 'sqlite') {
        const rows = await this.query('SELECT * FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
        return normalizeUser(rows[0]);
      }

      const users = readLocal(STORAGE_KEYS.users, []);
      return users.find((user) => user.email === normalizedEmail) || null;
    },

    async getUserById(userId) {
      await this.init();
      if (!userId) return null;

      if (this.engine === 'sqlite') {
        const rows = await this.query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
        return normalizeUser(rows[0]);
      }

      const users = readLocal(STORAGE_KEYS.users, []);
      return users.find((user) => user.id === userId) || null;
    },

    setSession(userId) {
      writeLocal(STORAGE_KEYS.session, { userId, loggedInAt: now() });
    },

    getSession() {
      return readLocal(STORAGE_KEYS.session, null);
    },

    async getCurrentUser() {
      const session = this.getSession();
      return session ? this.getUserById(session.userId) : null;
    },

    clearSession() {
      localStorage.removeItem(STORAGE_KEYS.session);
    },

    async getCategories() {
      await this.init();

      if (this.engine === 'sqlite') {
        const rows = await this.query('SELECT * FROM categories ORDER BY name ASC');
        return rows.map(normalizeCategory);
      }

      return readLocal(STORAGE_KEYS.categories, []);
    },

    async getCategory(categoryId) {
      const categories = await this.getCategories();
      return categories.find((category) => category.id === categoryId) || null;
    },

    async getQuestionsByCategory(categoryId) {
      await this.init();

      if (this.engine === 'sqlite') {
        const rows = await this.query('SELECT * FROM questions WHERE category_id = ? ORDER BY id ASC', [categoryId]);
        return rows.map(normalizeQuestion);
      }

      return readLocal(STORAGE_KEYS.questions, []).filter((question) => question.categoryId === categoryId);
    },

    async saveAttempt(attempt) {
      await this.init();
      const savedAttempt = {
        ...attempt,
        id: attempt.id || createId('attempt'),
        completedAt: attempt.completedAt || now()
      };

      if (this.engine === 'sqlite') {
        await this.run(
          `INSERT INTO quiz_attempts
            (id, user_id, category_id, category_name, score, total_questions, percentage, grade, duration_seconds, status, answers_json, completed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            savedAttempt.id,
            savedAttempt.userId,
            savedAttempt.categoryId,
            savedAttempt.categoryName,
            savedAttempt.score,
            savedAttempt.totalQuestions,
            savedAttempt.percentage,
            savedAttempt.grade,
            savedAttempt.durationSeconds,
            savedAttempt.status,
            JSON.stringify(savedAttempt.answers),
            savedAttempt.completedAt
          ]
        );

        for (const answer of savedAttempt.answers) {
          await this.run(
            'INSERT INTO quiz_answers (id, attempt_id, question_id, selected_index, correct_index, is_correct) VALUES (?, ?, ?, ?, ?, ?)',
            [createId('answer'), savedAttempt.id, answer.questionId, answer.selectedIndex, answer.correctIndex, answer.isCorrect ? 1 : 0]
          );
        }
      } else {
        const attempts = readLocal(STORAGE_KEYS.attempts, []);
        attempts.push(savedAttempt);
        writeLocal(STORAGE_KEYS.attempts, attempts);
      }

      return savedAttempt;
    },

    async getAttempt(attemptId) {
      await this.init();
      if (!attemptId) return null;

      if (this.engine === 'sqlite') {
        const rows = await this.query('SELECT * FROM quiz_attempts WHERE id = ? LIMIT 1', [attemptId]);
        return normalizeAttempt(rows[0]);
      }

      const attempts = readLocal(STORAGE_KEYS.attempts, []);
      return attempts.find((attempt) => attempt.id === attemptId) || null;
    },

    async getAttemptsByUser(userId) {
      await this.init();
      if (!userId) return [];

      if (this.engine === 'sqlite') {
        const rows = await this.query('SELECT * FROM quiz_attempts WHERE user_id = ? ORDER BY completed_at DESC', [userId]);
        return rows.map(normalizeAttempt);
      }

      return readLocal(STORAGE_KEYS.attempts, [])
        .filter((attempt) => attempt.userId === userId)
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    },

    async getLeaderboard(limit = 5) {
      await this.init();

      if (this.engine === 'sqlite') {
        const rows = await this.query(
          `SELECT u.full_name AS fullName, qa.user_id AS userId, MAX(qa.percentage) AS percentage, COUNT(*) AS attempts
           FROM quiz_attempts qa
           INNER JOIN users u ON u.id = qa.user_id
           GROUP BY qa.user_id
           ORDER BY percentage DESC
           LIMIT ?`,
          [limit]
        );
        return rows.map((row) => ({ ...row, percentage: Number(row.percentage), attempts: Number(row.attempts) }));
      }

      const attempts = readLocal(STORAGE_KEYS.attempts, []);
      const users = readLocal(STORAGE_KEYS.users, []);
      const grouped = new Map();

      for (const attempt of attempts) {
        const current = grouped.get(attempt.userId);
        if (!current || attempt.percentage > current.percentage) {
          const user = users.find((item) => item.id === attempt.userId);
          grouped.set(attempt.userId, {
            userId: attempt.userId,
            fullName: user?.fullName || 'Student',
            percentage: attempt.percentage,
            attempts: attempts.filter((item) => item.userId === attempt.userId).length
          });
        }
      }

      return Array.from(grouped.values())
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, limit);
    },

    getStorageEngine() {
      return this.engine;
    }
  };

  window.QuizDB = QuizDB;
})();
