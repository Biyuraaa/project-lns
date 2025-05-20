Project LNS - Setup Guide
Overview
Project LNS is a comprehensive business management system for handling inquiries, quotations, purchase orders, and customer management. This guide will help you set up the project in your local development environment.
Project Structure
The project follows standard Laravel structure with additional organization for React components:

Controllers: Controllers
Models: Models
Routes: web.php
React Components: Pages
UI Components: Components
Types: types

Key Features

Dashboard: Overview of business metrics and activities
Inquiry Management: Track and manage customer inquiries
Quotation System: Create and manage quotations based on inquiries
Purchase Order Management: Process purchase orders with file attachments
Customer Management: Comprehensive customer database

Installation Steps
Follow these steps to set up the Project LNS application in your local environment:

1. Clone the Repository
   git clone https://github.com/Biyuraaa/project-lns.git
   cd project-lns
2. Install Dependencies

# Install PHP dependencies

composer install

# Install JavaScript dependencies

npm install 3. Set Up Environment Variables

# Create environment file

cp .env.example .env

# Generate application key

php artisan key:generate 4. Configure Database
Option 1: MySQL

# Start MySQL server (using XAMPP or other tool)

# Then update your .env file:

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=lns_db
DB_USERNAME=root
DB_PASSWORD=
Option 2: SQLite

# Update your .env file:

DB_CONNECTION=sqlite

# Create empty SQLite database file

touch database/database.sqlite 5. Set Up Database and Storage

# Run migrations

php artisan migrate

# Run seeders (optional)

php artisan db:seed

# Create storage symbolic link

php artisan storage:link 6. Run the Application

# Terminal 1: Start Laravel server

php artisan serve

# Terminal 2: Compile and watch for asset changes

npm run dev

# For production build (instead of npm run dev)

npm run build
Accessing the Application
Once the server is running, access the application at:

http://localhost:8000

System Requirements

PHP 8.1+
Node.js 16+
MySQL 5.7+ or SQLite 3.8.8+
Composer 2+

Troubleshooting
If you encounter any issues during installation, try:

# Clear application cache

php artisan cache:clear
php artisan config:clear

# Regenerate autoload files

composer dump-autoload
