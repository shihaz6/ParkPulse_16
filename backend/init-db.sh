#!/bin/bash

# Exit on error
set -e

echo "=========================================================="
echo "          ParkPulse MySQL Database Initializer            "
echo "=========================================================="
echo ""

# Check if mysql client is installed
if ! command -v mysql &> /dev/null
then
    echo "ERROR: 'mysql' client command line tool could not be found."
    echo "Please ensure MySQL is installed and added to your system PATH."
    exit 1
fi

INIT_SQL="src/main/resources/init-mysql.sql"

# Check if init script exists
if [ ! -f "$INIT_SQL" ]; then
    echo "ERROR: SQL initialization script not found at $INIT_SQL"
    exit 1
fi

echo "This script will connect to MySQL as 'root' to run the setup script."
echo "You will be prompted for your MySQL root password."
echo ""

# Execute SQL script
mysql -u root -p < "$INIT_SQL"

echo ""
echo "=========================================================="
echo "SUCCESS: Database 'parkpulsedb' and user 'parkpulse_user'"
echo "have been successfully initialized."
echo "=========================================================="
