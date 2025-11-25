#!/usr/bin/env python3
"""
Clean up Python cache files that might be causing migration issues
"""
import os
import shutil

def cleanup_pycache():
    """Remove all __pycache__ directories"""
    removed_count = 0
    
    for root, dirs, files in os.walk('.'):
        if '__pycache__' in dirs:
            pycache_path = os.path.join(root, '__pycache__')
            try:
                shutil.rmtree(pycache_path)
                print(f"✅ Removed: {pycache_path}")
                removed_count += 1
            except Exception as e:
                print(f"❌ Failed to remove {pycache_path}: {e}")
    
    print(f"\n🧹 Cleanup complete! Removed {removed_count} __pycache__ directories.")
    return removed_count > 0

if __name__ == "__main__":
    print("🧹 Cleaning up Python cache files...")
    cleanup_pycache()
