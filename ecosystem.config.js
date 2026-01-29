module.exports = {
  apps: [
    {
      name: 'buy2rent-backend',
      cwd: '/root/buy2rent/backend',
      script: '/root/buy2rent/backend/myenv/bin/gunicorn',
      args: 'config.wsgi:application --bind 127.0.0.1:8000 --workers 3 --timeout 120',
      interpreter: 'none',
      env: {
        DJANGO_SETTINGS_MODULE: 'config.settings',
        PYTHONPATH: '/root/buy2rent/backend'
      },
      error_file: '/root/buy2rent/logs/backend-error.log',
      out_file: '/root/buy2rent/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'buy2rent-frontend',
      cwd: '/root/buy2rent/frontend',
      script: './start-frontend.sh',
      interpreter: 'bash',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/root/buy2rent/logs/frontend-error.log',
      out_file: '/root/buy2rent/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'email-monitor',
      cwd: '/root/buy2rent/backend',
      script: './email_monitor_pm2.sh',
      interpreter: 'bash',
      env: {
        DJANGO_SETTINGS_MODULE: 'config.settings'
      },
      error_file: '/root/buy2rent/logs/email-monitor-error.log',
      out_file: '/root/buy2rent/logs/email-monitor-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
