(function () {
  'use strict';

  function escapeHTML(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat('en', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }

  function average(values) {
    if (values.length === 0) return 0;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  }

  async function initializeDashboard() {
    const statCards = document.getElementById('statCards');
    if (!statCards) return;

    await window.QuizDB.init();
    const currentUser = await window.QuizDB.getCurrentUser();
    if (!currentUser) return;

    const attempts = await window.QuizDB.getAttemptsByUser(currentUser.id);
    const categories = await window.QuizDB.getCategories();
    const leaderboard = await window.QuizDB.getLeaderboard(5);

    renderStats(attempts);
    renderCategoryPerformance(categories, attempts);
    renderAttemptHistory(attempts);
    renderLeaderboard(leaderboard);
  }

  function renderStats(attempts) {
    const statCards = document.getElementById('statCards');
    const bestScore = attempts.length ? Math.max(...attempts.map((attempt) => attempt.percentage)) : 0;
    const averageScore = average(attempts.map((attempt) => attempt.percentage));
    const completed = attempts.filter((attempt) => attempt.status === 'completed').length;

    statCards.innerHTML = `
      <article class="stat-card"><span class="muted">Attempts</span><span class="stat-value">${attempts.length}</span></article>
      <article class="stat-card"><span class="muted">Average</span><span class="stat-value">${averageScore}%</span></article>
      <article class="stat-card"><span class="muted">Best</span><span class="stat-value">${bestScore}%</span></article>
      <article class="stat-card"><span class="muted">Completed</span><span class="stat-value">${completed}</span></article>
    `;
  }

  function renderCategoryPerformance(categories, attempts) {
    const container = document.getElementById('categoryPerformance');
    if (!container) return;

    if (attempts.length === 0) {
      container.innerHTML = '<p class="muted">No category performance yet. Take your first quiz.</p>';
      return;
    }

    container.innerHTML = categories.map((category) => {
      const categoryAttempts = attempts.filter((attempt) => attempt.categoryId === category.id);
      const categoryAverage = average(categoryAttempts.map((attempt) => attempt.percentage));

      return `
        <div class="performance-row">
          <div class="performance-label">
            <span>${escapeHTML(category.name)}</span>
            <span>${categoryAttempts.length ? `${categoryAverage}%` : 'No attempts'}</span>
          </div>
          <div class="progress">
            <div class="progress-bar" style="width:${categoryAverage}%; background:${category.color}"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderAttemptHistory(attempts) {
    const container = document.getElementById('attemptHistory');
    if (!container) return;

    if (attempts.length === 0) {
      container.innerHTML = '<p class="muted">No quiz attempts yet. Start from the home page.</p>';
      return;
    }

    container.innerHTML = attempts.slice(0, 8).map((attempt) => `
      <article class="attempt-row">
        <strong>${escapeHTML(attempt.categoryName)} - ${attempt.percentage}%</strong>
        <span class="muted">Score ${attempt.score}/${attempt.totalQuestions} | Grade ${escapeHTML(attempt.grade)} | ${formatDate(attempt.completedAt)}</span>
      </article>
    `).join('');
  }

  function renderLeaderboard(leaderboard) {
    const container = document.getElementById('leaderboardRows');
    if (!container) return;

    if (leaderboard.length === 0) {
      container.innerHTML = '<p class="muted">Leaderboard appears after students complete quizzes.</p>';
      return;
    }

    container.innerHTML = leaderboard.map((row, index) => `
      <div class="leaderboard-row">
        <span><span class="leaderboard-rank">${index + 1}</span>${escapeHTML(row.fullName)}</span>
        <strong>${row.percentage}%</strong>
      </div>
    `).join('');
  }

  document.addEventListener('DOMContentLoaded', initializeDashboard);
})();
