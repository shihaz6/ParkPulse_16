@echo off
REM MySQL Database Table Viewer for ParkPulse
REM This script connects to MySQL and shows all tables

echo ============================================
echo   ParkPulse MySQL Database Table Viewer
echo ============================================
echo.

REM Database configuration from application-mysql.properties
set MYSQL_HOST=localhost
set MYSQL_PORT=3306
set MYSQL_DB=parkpulsedb
set MYSQL_USER=parkpulse_user
set MYSQL_PASS=shihaz#1

echo Connecting to: %MYSQL_HOST%:%MYSQL_PORT%/%MYSQL_DB%
echo User: %MYSQL_USER%
echo.

REM Check if mysql command is available
where mysql >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: MySQL client not found in PATH
    echo Please add MySQL bin directory to your system PATH
    echo Example: C:\Program Files\MySQL\MySQL Server 8.0\bin
    pause
    exit /b 1
)

echo Showing all tables...
echo.

mysql -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASS% %MYSQL_DB% -e "SHOW TABLES;"

echo.
echo ============================================
echo Done.
pause