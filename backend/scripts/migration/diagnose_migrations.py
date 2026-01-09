#!/usr/bin/env python3
"""
Diagnose Django migration issues
"""
import os
import sys
import django
from pathlib import Path

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from django.db.migrations.loader import MigrationLoader
from django.db.migrations.recorder import MigrationRecorder

def diagnose_migrations():
    """Diagnose migration issues"""
    print("🔍 Django Migration Diagnosis")
    print("=" * 50)
    
    # Check migration loader
    try:
        loader = MigrationLoader(connection)
        print("✅ Migration loader created successfully")
        
        # Check for unapplied migrations
        unapplied = loader.graph.leaf_nodes()
        print(f"📋 Leaf nodes (latest migrations): {len(unapplied)}")
        
        for app, migration in unapplied:
            print(f"   - {app}.{migration}")
            
    except Exception as e:
        print(f"❌ Migration loader error: {e}")
        return False
    
    # Check migration recorder
    try:
        recorder = MigrationRecorder(connection)
        applied = recorder.applied_migrations()
        print(f"✅ Applied migrations: {len(applied)}")
        
        for app, migration in applied:
            print(f"   - {app}.{migration}")
            
    except Exception as e:
        print(f"❌ Migration recorder error: {e}")
        return False
    
    # Check for problematic files
    print("\n🔍 Checking for problematic migration files...")
    
    apps_dir = Path('.')
    for app_dir in apps_dir.glob('*/migrations/'):
        app_name = app_dir.parent.name
        if app_name.startswith('.') or app_name == 'venv':
            continue
            
        print(f"\n📁 {app_name} migrations:")
        migration_files = sorted(app_dir.glob('*.py'))
        
        for migration_file in migration_files:
            if migration_file.name == '__init__.py':
                continue
            print(f"   - {migration_file.name}")
    
    return True

if __name__ == "__main__":
    try:
        diagnose_migrations()
    except Exception as e:
        print(f"❌ Diagnosis failed: {e}")
        sys.exit(1)
