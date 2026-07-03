@echo off
echo ==========================================================
echo           ParkPulse MySQL Database Initializer            
echo ==========================================================
echo.

where mysql >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: 'mysql' client command line tool could not be found.
    echo Please ensure MySQL is installed and added to your system PATH.
    pause
    exit /b 1
)

set "INIT_SQL=src\main\resources\init-mysql.sql"

if not exist "%INIT_SQL%" (
    echo ERROR: SQL initialization script not found at %INIT_SQL%
    pause
    exit /b 1
)

echo This script will connect to MySQL as 'root' to run the setup script.
echo You will be prompted for your MySQL root password.
echo.

mysql -u root -p < "%INIT_SQL%"

echo.
echo ==========================================================
echo SUCCESS: Database 'parkpulsedb' and user 'parkpulse_user'
echo have been successfully initialized.
echo ==========================================================
pause
