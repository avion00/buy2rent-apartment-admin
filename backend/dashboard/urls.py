from django.urls import path
from .views import (
    DashboardStatsView,
    DashboardChartsView,
    DashboardRecentActivitiesView,
    DashboardQuickStatsView,
    DashboardOverviewView
)
from .views_ai import (
    AIEmailDashboardView,
    AIEmailApprovalView,
    AIEmailAutoApprovalConfigView
)

app_name = 'dashboard'

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('charts/', DashboardChartsView.as_view(), name='dashboard-charts'),
    path('recent-activities/', DashboardRecentActivitiesView.as_view(), name='dashboard-recent'),
    path('quick-stats/', DashboardQuickStatsView.as_view(), name='dashboard-quick'),
    path('overview/', DashboardOverviewView.as_view(), name='dashboard-overview'),
    
    # AI Email Management
    path('ai-email/', AIEmailDashboardView.as_view(), name='ai-email-dashboard'),
    path('ai-email/approve/', AIEmailApprovalView.as_view(), name='ai-email-approve'),
    path('ai-email/config/', AIEmailAutoApprovalConfigView.as_view(), name='ai-email-config'),
]
