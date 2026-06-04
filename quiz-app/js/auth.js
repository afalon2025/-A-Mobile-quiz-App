(function () {
  'use strict';

  function getMessageBox() {
    return document.getElementById('authMessage');
  }

  function showMessage(message, type = 'danger') {
    const messageBox = getMessageBox();
    if (!messageBox) return;

    messageBox.textContent = message;
    messageBox.className = `alert alert-${type}`;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function hashPassword(password) {
    // Web Crypto provides a simple one-way hash for this local demo project.
    if (window.crypto?.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const digest = await window.crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
    }

    // Fallback keeps older browsers functional, but Web Crypto is preferred.
    let hash = 0;
    for (let index = 0; index < password.length; index += 1) {
      hash = (hash << 5) - hash + password.charCodeAt(index);
      hash |= 0;
    }
    return `fallback-${hash}`;
  }

  async function protectPage() {
    if (!document.body.hasAttribute('data-protected')) return true;

    const currentUser = await window.QuizDB.getCurrentUser();
    if (!currentUser) {
      window.location.replace('login.html');
      return false;
    }

    return true;
  }

  async function redirectGuestsAwayFromAuthPages() {
    if (!document.body.hasAttribute('data-guest')) return;

    const currentUser = await window.QuizDB.getCurrentUser();
    if (currentUser) {
      window.location.replace('home.html');
    }
  }

  async function renderCurrentUser() {
    const currentUser = await window.QuizDB.getCurrentUser();
    if (!currentUser) return;

    document.querySelectorAll('#currentUserName').forEach((element) => {
      element.textContent = currentUser.fullName.split(' ')[0];
    });

    document.querySelectorAll('[data-user-email]').forEach((element) => {
      element.textContent = currentUser.email;
    });
  }

  function bindLogoutButtons() {
    document.querySelectorAll('[data-logout]').forEach((button) => {
      button.addEventListener('click', () => {
        window.QuizDB.clearSession();
        sessionStorage.removeItem('lastAttemptId');
        window.location.href = 'login.html';
      });
    });
  }

  function bindRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const fullName = String(formData.get('fullName') || '').trim();
      const email = String(formData.get('email') || '').trim().toLowerCase();
      const password = String(formData.get('password') || '');
      const confirmPassword = String(formData.get('confirmPassword') || '');

      if (fullName.length < 2) {
        showMessage('Please enter your full name.');
        return;
      }

      if (!isValidEmail(email)) {
        showMessage('Please enter a valid email address.');
        return;
      }

      if (password.length < 6) {
        showMessage('Password must be at least 6 characters.');
        return;
      }

      if (password !== confirmPassword) {
        showMessage('Passwords do not match.');
        return;
      }

      try {
        const passwordHash = await hashPassword(password);
        const user = await window.QuizDB.createUser({ fullName, email, passwordHash });
        window.QuizDB.setSession(user.id);
        showMessage('Account created successfully. Redirecting...', 'success');
        window.setTimeout(() => {
          window.location.href = 'home.html';
        }, 450);
      } catch (error) {
        showMessage(error.message || 'Registration failed. Please try again.');
      }
    });
  }

  function bindLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const email = String(formData.get('email') || '').trim().toLowerCase();
      const password = String(formData.get('password') || '');

      if (!isValidEmail(email) || !password) {
        showMessage('Enter a valid email and password.');
        return;
      }

      try {
        const user = await window.QuizDB.findUserByEmail(email);
        const passwordHash = await hashPassword(password);

        if (!user || user.passwordHash !== passwordHash) {
          showMessage('Invalid login details.');
          return;
        }

        window.QuizDB.setSession(user.id);
        showMessage('Login successful. Redirecting...', 'success');
        window.setTimeout(() => {
          window.location.href = 'home.html';
        }, 350);
      } catch (error) {
        showMessage(error.message || 'Login failed. Please try again.');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await window.QuizDB.init();
    const canContinue = await protectPage();
    if (!canContinue) return;

    await redirectGuestsAwayFromAuthPages();
    await renderCurrentUser();
    bindLogoutButtons();
    bindRegisterForm();
    bindLoginForm();
  });
})();
