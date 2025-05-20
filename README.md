# Project LNS - Setup Guide

## Overview

**Project LNS** is a comprehensive business management system for handling inquiries, quotations, purchase orders, and customer management. This guide will help you set up the project in your local development environment.

---

## Project Structure

The project follows standard Laravel structure with additional organization for React components:

-   **Controllers**: `app/Http/Controllers`
-   **Models**: `app/Models`
-   **Routes**: `routes/web.php`
-   **React Components**: `resources/js/Pages`
-   **UI Components**: `resources/js/Components`
-   **Types**: `resources/js/types`

---

## Key Features

-   **Dashboard**: Overview of business metrics and activities
-   **Inquiry Management**: Track and manage customer inquiries
-   **Quotation System**: Create and manage quotations based on inquiries
-   **Purchase Order Management**: Process purchase orders with file attachments
-   **Customer Management**: Comprehensive customer database

---

## Installation Steps

Follow these steps to set up the Project LNS application in your local environment:

### 1. Clone the Repository

```bash
git clone https://github.com/Biyuraaa/project-lns.git
cd project-lns


```

### 2. Install Dependencies

```bash
composer install
npm install
```

### 3. Set Up Environment Variables

Copy the `.env.example` file to `.env` and configure your database and other environment variables.

```bash
cp .env.example .env
```

### 4. Configure Database

## Option 1: Use SQLite

Update your .env file:

```bash
DB_CONNECTION=sqlite
```

Then create an empty SQLite file:

```bash
touch database/database.sqlite
```

## Option 2: Use MySQL

Start MySQL server (e.g., via XAMPP), then update your .env file:

```bash
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=lns_db
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Run Migrations

```bash
php artisan migrate
```

### 6. Seed the Database (Optional)

```bash
php artisan db:seed
```

### 7. Generate Application Key

```bash
php artisan key:generate
```

### 8. Start the Development Server

```bash
php artisan serve
```

### 9. Compile Assets

```bash
npm run dev
```

### 10. Access the Application

## Open your web browser and navigate to `http://localhost:8000` to access the application.
