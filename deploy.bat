@echo off
REM Deploy Mobile Quiz App to Netlify

echo ====================================
echo Mobile Quiz - Deployment Helper
echo ====================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed. Please install from: https://git-scm.com
    pause
    exit /b 1
)

REM Check if node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install from: https://nodejs.org
    pause
    exit /b 1
)

echo ✓ Git found: 
git --version
echo ✓ Node found: 
node --version
echo.

echo Choose deployment method:
echo 1. GitHub + Netlify (Recommended - Auto Updates)
echo 2. Deploy to Netlify (Drag & Drop)
echo 3. Test locally first
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo Follow these steps:
    echo 1. Go to https://github.com/signup
    echo 2. Create a repository called "mobile-quiz-app"
    echo 3. Copy this folder to your GitHub repository
    echo 4. Go to https://app.netlify.com/signup
    echo 5. Connect your GitHub account
    echo 6. Select the repository and deploy
    echo.
    echo See DEPLOYMENT.md for detailed instructions
    pause

) else if "%choice%"=="2" (
    echo.
    echo Go to: https://app.netlify.com/drop
    echo Drag and drop the "quiz-app" folder onto the page
    echo Your app will be live in seconds!
    pause

) else if "%choice%"=="3" (
    echo.
    echo Testing app locally...
    cd quiz-app
    npm install http-server -g
    npx http-server . -p 8080 -o
    
) else (
    echo Invalid choice
    pause
)
