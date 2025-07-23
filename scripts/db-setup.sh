#!/bin/bash

# Database setup script using psql
# This script manages database schema using SQL files
# Note that SUPABASE_PROJECT_PASSWD can be seen by ps command, so use on trusted systems only.

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables safely
if [ -f .env.local ]; then
    set -a  # Enable automatic export of variables
    source .env.local
    set +a  # Disable automatic export
else
    echo -e "${RED}❌ .env.local file not found${NC}"
    exit 1
fi

# Check required variables
if [ -z "$SUPABASE_PROJECT_ID" ] || [ -z "$SUPABASE_PROJECT_PASSWD" ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    echo "   SUPABASE_PROJECT_ID: ${SUPABASE_PROJECT_ID:+SET}"
    echo "   SUPABASE_PROJECT_PASSWD: ${SUPABASE_PROJECT_PASSWD:+SET}"
    exit 1
fi

# Build connection string
DB_CONNECTION="postgresql://postgres:$SUPABASE_PROJECT_PASSWD@db.$SUPABASE_PROJECT_ID.supabase.co:5432/postgres"

# Function to execute SQL file
execute_sql_file() {
    local sql_file="$1"
    local description="$2"
    
    if [ ! -f "$sql_file" ]; then
        echo -e "${RED}❌ SQL file not found: $sql_file${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🔄 $description${NC}"
    echo "   File: $sql_file"
    
    if psql "$DB_CONNECTION" -f "$sql_file" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Success${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed${NC}"
        return 1
    fi
}

# Function to execute SQL command
execute_sql_command() {
    local sql_command="$1"
    local description="$2"
    
    echo -e "${BLUE}🔄 $description${NC}"
    
    if psql "$DB_CONNECTION" -c "$sql_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Success${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed${NC}"
        return 1
    fi
}

# Function to check if tables exist
check_tables_exist() {
    local tables=("tag_keys" "tag_values" "memories" "memory_tag")
    local all_exist=true
    
    for table in "${tables[@]}"; do
        if ! psql "$DB_CONNECTION" -c "SELECT 1 FROM $table LIMIT 1;" > /dev/null 2>&1; then
            all_exist=false
            break
        fi
    done
    
    if [ "$all_exist" = true ]; then
        return 0
    else
        return 1
    fi
}

# Main command processing
case "$1" in
    "setup")
        echo -e "${YELLOW}🚀 Setting up InstaMem database...${NC}"
        
        if check_tables_exist; then
            echo -e "${GREEN}✅ Database schema already exists${NC}"
        else
            echo -e "${BLUE}📋 Creating database schema...${NC}"
            execute_sql_file "db/setup-database.sql" "Creating tables, indexes, and policies"
        fi
        
        echo -e "${BLUE}🌱 Seeding initial data...${NC}"
        # We'll create a separate seed file
        execute_sql_file "db/seed-data.sql" "Inserting initial tag data"
        
        echo -e "${GREEN}🎉 Database setup completed successfully!${NC}"
        ;;
        
    "reset")
        echo -e "${YELLOW}🗑️  Resetting database...${NC}"
        
        # Drop all tables
        execute_sql_command "DROP TABLE IF EXISTS memory_tag CASCADE;" "Dropping memory_tag table"
        execute_sql_command "DROP TABLE IF EXISTS memories CASCADE;" "Dropping memories table"
        execute_sql_command "DROP TABLE IF EXISTS tag_values CASCADE;" "Dropping tag_values table"
        execute_sql_command "DROP TABLE IF EXISTS tag_keys CASCADE;" "Dropping tag_keys table"
        
        echo -e "${GREEN}✅ Database reset completed${NC}"
        ;;
        
    "check")
        echo -e "${YELLOW}🔍 Checking database status...${NC}"
        
        # Test connection
        if psql "$DB_CONNECTION" -c "SELECT version();" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Database connection successful${NC}"
        else
            echo -e "${RED}❌ Database connection failed${NC}"
            exit 1
        fi
        
        # Check tables
        if check_tables_exist; then
            echo -e "${GREEN}✅ Database schema exists${NC}"
            
            # Show table counts
            echo -e "${BLUE}📊 Table statistics:${NC}"
            for table in "tag_keys" "tag_values" "memories" "memory_tag"; do
                count=$(psql "$DB_CONNECTION" -t -c "SELECT COUNT(*) FROM $table;" | tr -d ' ')
                echo "   $table: $count rows"
            done
            
            # Show user count
            user_count=$(psql "$DB_CONNECTION" -t -c "SELECT COUNT(DISTINCT user_id) FROM memories;" | tr -d ' ')
            echo "   users: $user_count users"
        else
            echo -e "${RED}❌ Database schema missing${NC}"
        fi
        ;;
        
    "seed")
        echo -e "${YELLOW}🌱 Seeding database...${NC}"
        execute_sql_file "db/seed-data.sql" "Inserting initial data"
        ;;
        
    *)
        echo -e "${BLUE}InstaMem Database Management${NC}"
        echo ""
        echo "Usage: $0 {setup|reset|check|seed}"
        echo ""
        echo "Commands:"
        echo "  setup  - Create database schema and seed initial data"
        echo "  reset  - Drop all tables and reset database"
        echo "  check  - Check database connection and schema status"
        echo "  seed   - Insert initial data only"
        echo ""
        echo "Examples:"
        echo "  $0 setup"
        echo "  $0 check"
        echo "  $0 reset"
        ;;
esac