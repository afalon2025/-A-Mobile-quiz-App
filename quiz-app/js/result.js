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

  function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  function getResultMessage(percentage) {
    if (percentage >= 80) return 'Excellent performance. Keep challenging yourself.';
    if (percentage >= 60) return 'Good work. Review missed questions and try again.';
    if (percentage >= 50) return 'Fair attempt. More practice will improve your score.';
    return 'Keep studying. Retake the quiz after reviewing the topic.';
  }

  async function initializeResultPage() {
    const resultContent = document.getElementById('resultContent');
    if (!resultContent) return;

    await window.QuizDB.init();
    const params = new URLSearchParams(window.location.search);
    const attemptId = params.get('attempt') || sessionStorage.getItem('lastAttemptId');
    const attempt = await window.QuizDB.getAttempt(attemptId);

    if (!attempt) {
      resultContent.innerHTML = `
        <section class="card center-card">
          <h1>No result found</h1>
          <p class="muted">Complete a quiz first to view your result.</p>
          <a class="button button-primary" href="home.html">Go to categories</a>
        </section>
      `;
      return;
    }

    renderResult(resultContent, attempt);
  }

  function renderResult(container, attempt) {
    const scoreAngle = `${attempt.percentage * 3.6}deg`;
    const reviewItems = attempt.answers.map((answer, index) => `
      <article class="review-item ${answer.isCorrect ? 'correct' : 'incorrect'}">
        <h3>${index + 1}. ${escapeHTML(answer.question)}</h3>
        <p><strong>Your answer:</strong> ${escapeHTML(answer.selectedText)}</p>
        <p><strong>Correct answer:</strong> ${escapeHTML(answer.correctText)}</p>
        <p class="muted">${escapeHTML(answer.explanation)}</p>
      </article>
    `).join('');

    container.innerHTML = `
      <section class="card center-card">
        <p class="eyebrow">Quiz result</p>
        <div class="score-ring" style="--score-angle:${scoreAngle}">
          <strong>${attempt.percentage}%</strong>
        </div>
        <h1>${escapeHTML(attempt.categoryName)} Quiz</h1>
        <p>${escapeHTML(getResultMessage(attempt.percentage))}</p>
        <div class="stat-grid">
          <div class="stat-card"><span class="muted">Score</span><span class="stat-value">${attempt.score}/${attempt.totalQuestions}</span></div>
          <div class="stat-card"><span class="muted">Grade</span><span class="stat-value">${escapeHTML(attempt.grade)}</span></div>
          <div class="stat-card"><span class="muted">Time</span><span class="stat-value">${formatDuration(attempt.durationSeconds)}</span></div>
          <div class="stat-card"><span class="muted">Status</span><span class="stat-value">${attempt.status === 'time-up' ? 'Time' : 'Done'}</span></div>
        </div>
        <div class="result-actions">
          <a class="button button-primary" href="quiz.html?category=${encodeURIComponent(attempt.categoryId)}">Retake quiz</a>
          <a class="button button-secondary" href="dashboard.html">View dashboard</a>
          <a class="button button-ghost" href="home.html">Choose topic</a>
        </div>
      </section>

      <section class="card">
        <h2>Answer Review</h2>
        <div class="answer-review">${reviewItems}</div>
      </section>
    `;
  }

  document.addEventListener('DOMContentLoaded', initializeResultPage);
})();
