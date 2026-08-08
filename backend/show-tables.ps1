<#
.SYNOPSIS
    ParkPulse MySQL Database Table Viewer
    Shows all tables, row counts, sizes, and structures
#>

param(
    [string]$DbHost = "localhost",
    [int]$DbPort = 3306,
    [string]$Database = "parkpulsedb",
    [string]$DbUser = "parkpulse_user",
    [string]$DbPass = "shihaz#1"
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ParkPulse MySQL Database Viewer" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Find mysql.exe
$mysqlExe = $null
$paths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 9.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 9.6\bin\mysql.exe"
)
foreach ($p in $paths) {
    if (Test-Path $p) { $mysqlExe = $p; break }
}
if (-not $mysqlExe) {
    $where = Get-Command mysql -ErrorAction SilentlyContinue
    if ($where) { $mysqlExe = $where.Source }
}
if (-not $mysqlExe) {
    Write-Host "ERROR: MySQL client not found. Install MySQL or add to PATH." -ForegroundColor Red
    exit 1
}

Write-Host "Using MySQL at: $mysqlExe" -ForegroundColor Gray
Write-Host ("Connecting to: {0}:{1}/{2}" -f $DbHost, $DbPort, $Database) -ForegroundColor Gray
Write-Host ""

# Test connection
$connArgs = "-h $DbHost -P $DbPort -u $DbUser -p$DbPass $Database"
& $mysqlExe $connArgs -e "SELECT 1;" >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Could not connect to MySQL" -ForegroundColor Red
    Write-Host "Check: MySQL running? Correct credentials? Database exists?" -ForegroundColor Yellow
    exit 1
}

Write-Host "Connection successful!" -ForegroundColor Green
Write-Host ""

# 1. All tables
Write-Host "=== 1. ALL TABLES ===" -ForegroundColor Green
& $mysqlExe $connArgs -e "SHOW TABLES;"

Write-Host ""

# 2. Table stats
Write-Host "=== 2. TABLE ROW COUNTS & SIZES ===" -ForegroundColor Green
& $mysqlExe $connArgs -e @"
SELECT 
    TABLE_NAME as 'Table',
    TABLE_ROWS as 'Rows',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as 'Size_MB'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = '$Database'
ORDER BY TABLE_ROWS DESC;
"@

Write-Host ""

# 3. Table structures
Write-Host "=== 3. TABLE STRUCTURES ===" -ForegroundColor Green
$tables = & $mysqlExe $connArgs -e "SHOW TABLES;" --skip-column-names --batch
$tables = $tables.Trim().Split("`n") | Where-Object { $_ -ne "Tables_in_$Database" -and $_ -ne "" }

foreach ($table in $tables) {
    $table = $table.Trim()
    if ($table) {
        Write-Host ""
        Write-Host "--- Table: $table ---" -ForegroundColor Yellow
        & $mysqlExe $connArgs -e "DESCRIBE `$table`;"
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Done." -ForegroundColor Cyan
Read-Host "Press Enter to exit"