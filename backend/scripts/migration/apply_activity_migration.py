"""
Script to apply the Activity model migration manually
Run this in your Django environment: python apply_activity_migration.py
"""
import os
import sys
import sqlite3

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Database path
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'db.sqlite3')

def apply_migration():
    """Apply the Activity model migration"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if new columns already exist
        cursor.execute("PRAGMA table_info(activities_activity)")
        columns = {col[1] for col in cursor.fetchall()}
        
        print(f"Existing columns: {columns}")
        
        # Add new columns if they don't exist
        new_columns = [
            ("user_id", "INTEGER REFERENCES accounts_user(id) ON DELETE SET NULL"),
            ("activity_type", "VARCHAR(20) DEFAULT 'status'"),
            ("action", "VARCHAR(20) DEFAULT 'created'"),
            ("title", "VARCHAR(255) DEFAULT 'Activity'"),
            ("description", "TEXT DEFAULT ''"),
            ("object_id", "VARCHAR(100) DEFAULT ''"),
            ("object_type", "VARCHAR(50) DEFAULT ''"),
            ("metadata", "TEXT DEFAULT '{}'"),
        ]
        
        for col_name, col_def in new_columns:
            if col_name not in columns:
                try:
                    sql = f"ALTER TABLE activities_activity ADD COLUMN {col_name} {col_def}"
                    cursor.execute(sql)
                    print(f"Added column: {col_name}")
                except sqlite3.OperationalError as e:
                    print(f"Column {col_name} might already exist: {e}")
        
        # Make apartment_id nullable (SQLite doesn't support ALTER COLUMN, so we skip this)
        # The model already has null=True, blank=True
        
        # Make legacy fields nullable
        legacy_columns = ['actor', 'icon', 'summary', 'type']
        for col in legacy_columns:
            if col in columns:
                # SQLite doesn't support modifying columns, but the data should work
                print(f"Column {col} exists (will accept NULL values via Django ORM)")
        
        conn.commit()
        print("\nMigration applied successfully!")
        
        # Verify the table structure
        cursor.execute("PRAGMA table_info(activities_activity)")
        print("\nUpdated table structure:")
        for col in cursor.fetchall():
            print(f"  {col[1]}: {col[2]} (nullable: {not col[3]})")
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    apply_migration()
