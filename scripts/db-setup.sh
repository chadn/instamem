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

# Function to generate a random password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-16
}

# Function to update or add environment variable in .env.local
update_env_var() {
    local var_name="$1"
    local var_value="$2"
    local env_file=".env.local"
    
    if grep -q "^${var_name}=" "$env_file"; then
        # Variable exists, update it
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/^${var_name}=.*/${var_name}=${var_value}/" "$env_file"
        else
            # Linux
            sed -i "s/^${var_name}=.*/${var_name}=${var_value}/" "$env_file"
        fi
    else
        # Variable doesn't exist, add it
        echo "${var_name}=${var_value}" >> "$env_file"
    fi
}

# Function to create test user SQL file and execute it
create_test_user_sql() {
    local email="$1"
    local password="$2"
    local temp_sql_file="$(mktemp)"
    
    # Generate UUID for the user
    local user_id=$(uuidgen | tr '[:upper:]' '[:lower:]')
    
    # Create SQL to insert test user into auth.users table
    cat > "$temp_sql_file" << EOF
-- Create test user for E2E testing
-- This inserts directly into Supabase's auth schema

-- First, check if user already exists and delete if needed
DELETE FROM auth.users WHERE email = '$email';

-- Insert the test user
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '$user_id'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    '$email',
    crypt('$password', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Test User"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Insert identity record
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES (
    '$user_id'::uuid,
    '$user_id'::uuid,
    '{"sub": "$user_id", "email": "$email"}',
    'email',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (provider, id) DO NOTHING;

-- Show confirmation
SELECT 'Test user created successfully:' as status;
SELECT id, email, email_confirmed_at FROM auth.users WHERE email = '$email';
EOF

    # Execute the SQL file
    if execute_sql_file "$temp_sql_file" "Creating test user in auth.users table"; then
        rm -f "$temp_sql_file"
        return 0
    else
        rm -f "$temp_sql_file"
        return 1
    fi
}

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

    "seed-test-user")
        echo -e "${YELLOW}👤 Creating test user for E2E tests...${NC}"
        
        # Generate test user credentials
        TEST_USER_EMAIL="test@instamem.local"
        TEST_USER_PASSWORD=$(generate_password)
        
        echo -e "${BLUE}📝 Generated credentials:${NC}"
        echo "   Email: $TEST_USER_EMAIL"
        echo "   Password: $TEST_USER_PASSWORD"
        
        # Store password in .env.local
        echo -e "${BLUE}💾 Updating .env.local...${NC}"
        update_env_var "TEST_USER_EMAIL" "$TEST_USER_EMAIL"
        update_env_var "TEST_USER_PASSWORD" "$TEST_USER_PASSWORD"
        
        # Create the user via SQL
        echo -e "${BLUE}🔐 Creating user in Supabase auth schema...${NC}"
        if create_test_user_sql "$TEST_USER_EMAIL" "$TEST_USER_PASSWORD"; then
            echo -e "${GREEN}🎉 Test user setup completed successfully!${NC}"
            echo -e "${BLUE}💡 You can now run E2E tests with cached authentication${NC}"
        else
            echo -e "${RED}❌ Failed to create test user${NC}"
            exit 1
        fi
        ;;
        
    *)
        echo -e "${BLUE}InstaMem Database Management${NC}"
        echo ""
        echo "Usage: $0 {setup|reset|check|seed|seed-test-user}"
        echo ""
        echo "Commands:"
        echo "  setup          - Create database schema and seed initial data"
        echo "  reset          - Drop all tables and reset database"
        echo "  check          - Check database connection and schema status"
        echo "  seed           - Insert initial data only"
        echo "  seed-test-user - Create test user for E2E testing with cached auth"
        echo ""
        echo "Examples:"
        echo "  $0 setup"
        echo "  $0 check"
        echo "  $0 reset"
        echo "  $0 seed-test-user"
        ;;
esac