@echo off
REM MySQL Database Detailed Viewer for ParkPulse
REM Shows all tables with their structure and row counts

echo ============================================
echo   ParkPulse MySQL Database Detailed Viewer
echo ============================================
echo.

REM Database configuration
set MYSQL_HOST=localhost
set MYSQL_PORT=3306
set MYSQL_DB=parkpulsedb
set MYSQL_USER=parkpulse_user
REM Note: Password contains # which is a comment char in batch - use ^# to escape
set MYSQL_PASS=shihaz^#1

echo Connecting to: %MYSQL_HOST%:%MYSQL_PORT%/%MYSQL_DB%
echo User: %MYSQL_USER%
echo.

REM Try to find mysql.exe in common locations
set MYSQL_EXE=
where mysql >nul 2>nul && set MYSQL_EXE=mysql
if not defined MYSQL_EXE if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" set MYSQL_EXE="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if not defined MYSQL_EXE if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql" set MYSQL_EXE="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql"
if not defined MYSQL_EXE if exist "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe" set MYSQL_EXE="C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe"
if not defined MYSQL_EXE for /d %%d in ("C:\Program Files\MySQL\MySQL Server*" "C:\Program Files (x86)\MySQL\MySQL Server*") do if exist "%%d\bin\mysql.exe" set MYSQL_EXE="%%d\bin\mysql.exe"

if not defined MYSQL_EXE (
    echo ERROR: MySQL client not found
    echo Searched in:
    echo   - System PATH (where mysql)
    echo   - C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe
    echo   - C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe
    echo.
    echo Please install MySQL Client or add MySQL bin directory to PATH
    pause
    exit /b 1
)

echo Found MySQL at: %MYSQL_EXE%
echo.

echo Testing connection...
%MYSQL_EXE% -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASS% -e "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Could not connect to MySQL
    echo Possible causes:
    echo  1. MySQL server is not running (run: net start mysql80)
    echo 2. Wrong host/port/user/password
    echo 3. Database '%MYSQL_DB%' doesn't exist
    echo 4. User '%MYSQL_USER%' doesn't have access
    echo.
    echo Try running MySQL manually:
    echo   %MYSQL_EXE% -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p
    pause
    exit /b 1
)

echo Connection successful!
echo.

echo ============================================
echo 1. ALL TABLES
echo ============================================
%MYSQL_EXE% -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASS% %MYSQL_DB% -e "SHOW TABLES;"
if %errorlevel% neq 0 (
    echo ERROR: Failed to show tables
)

echo.
echo ============================================
echo 2. TABLE ROW COUNTS & SIZES
echo ============================================
%MYSQL_EXE% -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASS% %MYSQL_DB% -e "
SELECT 
    TABLE_NAME as 'Table',
    TABLE_ROWS as 'Rows',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as 'Size_MB'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = '%MYSQL_DB%'
ORDER BY TABLE_ROWS DESC;
"
if %errorlevel% neq 0 (
    echo ERROR: Failed to get table stats
)

echo.
echo ============================================
echo 3. EACH TABLE STRUCTURE
echo ============================================
%MYSQL_EXE% -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASS% %MYSQL_DB% -e "SHOW TABLES;" --skip-column-names --batch > tables.tmp 2>&1
for /f "tokens=1" %%t in (tables.tmp) do (
    if not "%%t"=="Tables_in_%MYSQL_DB%" (
        echo.
        echo --- Table: %%t ---
        %MYSQL_EXE% -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASS% %MYSQL_DB% -e "DESCRIBE %%t;"
        if %errorlevel% neq 0 (
            echo ERROR: Failed to describe %%t
        )
    )
)
del tables.tmp 2>nul

echo.
echo ============================================
echo Done.
pause