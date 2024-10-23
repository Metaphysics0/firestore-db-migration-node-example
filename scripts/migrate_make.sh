#!/bin/bash

# Check if a filename argument is provided
if [ $# -eq 0 ]; then
    echo "Error: Please provide a migration name as an argument."
    echo "Usage: $0 <migration_name>"
    exit 1
fi

# Generate timestamp
timestamp=$(date +%Y%m%d%H%M%S)

# Create filename with timestamp prefix
filename="${timestamp}_$1.ts"

# Full path for the new migration file
migration_path="db_migrations/$filename"

# Create the migration file
touch "$migration_path"

# Output success message
echo "Created migration file $migration_path"