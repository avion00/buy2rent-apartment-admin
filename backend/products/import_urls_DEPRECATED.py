# DEPRECATED: This file is no longer used
# All import functionality has been moved to the unified ProductViewSet in views.py
# 
# The following endpoints are now available through /api/products/:
# - POST /api/products/import_excel/        (was: /api/products/import/)
# - GET  /api/products/import_template/     (was: /api/products/import/template/)
# - GET  /api/products/categories/          (was: /api/products/categories/<uuid:apartment_id>/)
# - GET  /api/products/by_category/         (was: /api/products/categories/<uuid:category_id>/products/)
# - GET  /api/products/import_sessions/     (was: /api/products/import-sessions/<uuid:apartment_id>/)
# - DELETE /api/products/delete_import_session/ (was: /api/products/import-sessions/<uuid:session_id>/delete/)
#
# This file can be safely deleted.

urlpatterns = []  # Empty - no longer used
