module.exports = {
  apps: [
    {
      name: 'buy2rent-backend-dev',
      cwd: '/root/buy2rent/backend',
      script: '/root/buy2rent/backend/myenv/bin/python',
      args: 'manage.py runserver 0.0.0.0:8000',
      interpreter: 'none',
      env: {
        DJANGO_SETTINGS_MODULE: 'config.settings',
        PYTHONPATH: '/root/buy2rent/backend',
        DEBUG: 'True'
      },
      watch: [
        '/root/buy2rent/backend',
      ],
      ignore_watch: [
        'node_modules',
        'myenv',
        '*.log',
        '__pycache__',
        '*.pyc',
        'db.sqlite3',
        'media',
        'static',
        '.git'
      ],
      watch_options: {
        followSymlinks: false,
        usePolling: false
      },
      error_file: '/root/buy2rent/logs/backend-dev-error.log',
      out_file: '/root/buy2rent/logs/backend-dev-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      max_restarts: 50,
      min_uptime: '5s'
    },
    {
      name: 'buy2rent-frontend-dev',
      cwd: '/root/buy2rent/frontend',
      script: 'npm',
      args: 'run dev -- --host 0.0.0.0',
      env: {
        NODE_ENV: 'development'
      },
      error_file: '/root/buy2rent/logs/frontend-dev-error.log',
      out_file: '/root/buy2rent/logs/frontend-dev-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
