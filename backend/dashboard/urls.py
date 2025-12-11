from django.urls import path
from .views import (
    DashboardStatsView,
    DashboardChartsView,
    DashboardRecentActivitiesView,
    DashboardQuickStatsView,
    DashboardOverviewView
)

app_name = 'dashboard'

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('charts/', DashboardChartsView.as_view(), name='dashboard-charts'),
    path('recent-activities/', DashboardRecentActivitiesView.as_view(), name='dashboard-recent'),
    path('quick-stats/', DashboardQuickStatsView.as_view(), name='dashboard-quick'),
    path('overview/', DashboardOverviewView.as_view(), name='dashboard-overview'),
]
