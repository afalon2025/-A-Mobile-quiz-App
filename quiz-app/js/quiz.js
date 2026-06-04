(function () {
  'use strict';

  const state = {
    category: null,
    questions: [],
    answers: [],
    currentIndex: 0,
    score: 0,
    startedAt: null,
    durationSeconds: 0,
    remainingSeconds: 0,
    timerId: null,
    finished: false
  };

  function escapeHTML(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = Math.max(0, totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  function getGrade(percentage) {
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  async function renderHomePage() {
    const categoryList = document.getElementById('categoryList');
    if (!categoryList) return;

    const categories = await window.QuizDB.getCategories();
    categoryList.innerHTML = categories.map((category) => `
      <article class="card category-card">
        <span class="category-icon" style="background:${category.color}">${escapeHTML(category.name.slice(0, 1))}</span>
        <div>
          <h3>${escapeHTML(category.name)}</h3>
          <p>${escapeHTML(category.description)}</p>
        </div>
        <a class="button button-primary full-width" href="quiz.html?category=${encodeURIComponent(category.id)}">Start quiz</a>
      </article>
    `).join('');

    await renderLeaderboard('leaderboardList');
  }

  async function renderLeaderboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const leaderboard = await window.QuizDB.getLeaderboard(5);
    if (leaderboard.length === 0) {
      element.innerHTML = '<p class="muted">No attempts yet. Complete a quiz to appear here.</p>';
      return;
    }

    element.innerHTML = leaderboard.map((row, index) => `
      <div class="leaderboard-row">
        <span><span class="leaderboard-rank">${index + 1}</span>${escapeHTML(row.fullName)}</span>
        <strong>${row.percentage}%</strong>
      </div>
    `).join('');
  }

  async function initializeQuizPage() {
    const quizScreen = document.getElementById('quizScreen');
    if (!quizScreen) return;

    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('category') || 'math';
    const category = await window.QuizDB.getCategory(categoryId);
    const questions = await window.QuizDB.getQuestionsByCategory(categoryId);

    if (!category || questions.length === 0) {
      quizScreen.innerHTML = `
        <div class="center-card">
          <h1>Quiz not found</h1>
          <p class="muted">Please choose an available category from the home page.</p>
          <a class="button button-primary" href="home.html">Back to categories</a>
        </div>
      `;
      return;
    }

    state.category = category;
    state.questions = questions;
    state.answers = new Array(questions.length).fill(null);
    state.currentIndex = 0;
    state.score = 0;
    state.startedAt = Date.now();
    state.durationSeconds = Math.max(60, questions.length * 20);
    state.remainingSeconds = state.durationSeconds;
    state.finished = false;

    document.getElementById('categoryName').textContent = category.name;
    document.getElementById('nextQuestionBtn').addEventListener('click', handleNextQuestion);

    renderQuestion();
    startTimer();
  }

  function startTimer() {
    updateTimerUI();
    state.timerId = window.setInterval(() => {
      state.remainingSeconds -= 1;
      updateTimerUI();

      if (state.remainingSeconds <= 0) {
        finishQuiz('time-up');
      }
    }, 1000);
  }

  function updateTimerUI() {
    const timerText = document.getElementById('timerText');
    const timerProgress = document.getElementById('timerProgress');
    if (!timerText || !timerProgress) return;

    timerText.textContent = formatTime(state.remainingSeconds);
    timerProgress.style.width = `${Math.max(0, (state.remainingSeconds / state.durationSeconds) * 100)}%`;
  }

  function renderQuestion() {
    const question = state.questions[state.currentIndex];
    const questionText = document.getElementById('questionText');
    const answerOptions = document.getElementById('answerOptions');
    const feedback = document.getElementById('feedback');
    const nextButton = document.getElementById('nextQuestionBtn');

    questionText.textContent = question.question;
    feedback.className = 'feedback hidden';
    feedback.textContent = '';
    nextButton.classList.add('hidden');

    answerOptions.innerHTML = question.options.map((option, index) => `
      <button class="answer-option" type="button" data-answer-index="${index}">
        ${escapeHTML(option)}
      </button>
    `).join('');

    answerOptions.querySelectorAll('[data-answer-index]').forEach((button) => {
      button.addEventListener('click', () => handleAnswer(Number(button.dataset.answerIndex)));
    });

    updateQuestionProgress();
  }

  function updateQuestionProgress() {
    const answeredCount = state.answers.filter(Boolean).length;
    const questionCounter = document.getElementById('questionCounter');
    const scorePreview = document.getElementById('scorePreview');
    const questionProgress = document.getElementById('questionProgress');

    questionCounter.textContent = `Question ${state.currentIndex + 1} of ${state.questions.length}`;
    scorePreview.textContent = `Score: ${state.score}`;
    questionProgress.style.width = `${(answeredCount / state.questions.length) * 100}%`;
  }

  function handleAnswer(selectedIndex) {
    if (state.answers[state.currentIndex] || state.finished) return;

    const question = state.questions[state.currentIndex];
    const isCorrect = selectedIndex === question.answerIndex;
    const feedback = document.getElementById('feedback');
    const nextButton = document.getElementById('nextQuestionBtn');

    if (isCorrect) {
      state.score += 1;
    }

    state.answers[state.currentIndex] = {
      questionId: question.id,
      question: question.question,
      options: question.options,
      selectedIndex,
      correctIndex: question.answerIndex,
      selectedText: question.options[selectedIndex],
      correctText: question.options[question.answerIndex],
      isCorrect,
      explanation: question.explanation
    };

    document.querySelectorAll('.answer-option').forEach((button) => {
      const optionIndex = Number(button.dataset.answerIndex);
      button.disabled = true;

      if (optionIndex === question.answerIndex) {
        button.classList.add('correct');
      } else if (optionIndex === selectedIndex) {
        button.classList.add('incorrect');
      }
    });

    feedback.className = `feedback ${isCorrect ? 'success' : 'danger'}`;
    feedback.textContent = isCorrect ? `Correct. ${question.explanation}` : `Not correct. ${question.explanation}`;
    nextButton.textContent = state.currentIndex === state.questions.length - 1 ? 'Finish quiz' : 'Next question';
    nextButton.classList.remove('hidden');
    updateQuestionProgress();
  }

  function handleNextQuestion() {
    if (state.currentIndex === state.questions.length - 1) {
      finishQuiz('completed');
      return;
    }

    state.currentIndex += 1;
    renderQuestion();
  }

  async function finishQuiz(status) {
    if (state.finished) return;
    state.finished = true;
    window.clearInterval(state.timerId);

    const completedAnswers = state.questions.map((question, index) => {
      return state.answers[index] || {
        questionId: question.id,
        question: question.question,
        options: question.options,
        selectedIndex: null,
        correctIndex: question.answerIndex,
        selectedText: 'Not answered',
        correctText: question.options[question.answerIndex],
        isCorrect: false,
        explanation: question.explanation
      };
    });

    const currentUser = await window.QuizDB.getCurrentUser();
    const totalQuestions = state.questions.length;
    const percentage = Math.round((state.score / totalQuestions) * 100);
    const attempt = await window.QuizDB.saveAttempt({
      userId: currentUser.id,
      categoryId: state.category.id,
      categoryName: state.category.name,
      score: state.score,
      totalQuestions,
      percentage,
      grade: getGrade(percentage),
      durationSeconds: Math.round((Date.now() - state.startedAt) / 1000),
      status,
      answers: completedAnswers
    });

    sessionStorage.setItem('lastAttemptId', attempt.id);
    window.location.href = `result.html?attempt=${encodeURIComponent(attempt.id)}`;
  }

  window.addEventListener('beforeunload', () => {
    window.clearInterval(state.timerId);
  });

  document.addEventListener('DOMContentLoaded', async () => {
    await window.QuizDB.init();
    await renderHomePage();
    await initializeQuizPage();
  });
})();
