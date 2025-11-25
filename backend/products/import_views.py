# DEPRECATED: This file is no longer used
# All import functionality has been moved to the unified ProductViewSet in views.py
# 
# This file was causing duplicate API endpoints in Swagger UI because DRF Spectacular
# was auto-discovering the @extend_schema decorated views even though they weren't
# registered in URLs.
#
# All functionality is now available through the unified ProductViewSet:
# - POST /api/products/import_excel/        (was: ProductImportView)
# - GET  /api/products/import_template/     (was: import_template_download)
# - GET  /api/products/categories/          (was: ProductCategoryListView)
# - GET  /api/products/by_category/         (was: ProductsByCategoryView)
# - GET  /api/products/import_sessions/     (was: ImportSessionListView)
# - DELETE /api/products/delete_import_session/ (was: delete_import_session)
#
# This file can be safely deleted.

# All views have been moved to the unified ProductViewSet
# No active code remains to prevent Swagger auto-discovery
