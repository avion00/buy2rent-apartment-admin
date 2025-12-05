from django.urls import path
from .views import ReportGeneratorView, ReportTemplatesView

app_name = 'reports'

urlpatterns = [
    path('generate/', ReportGeneratorView.as_view(), name='generate-report'),
    path('templates/', ReportTemplatesView.as_view(), name='report-templates'),
]
