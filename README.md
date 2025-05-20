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

### 4. Generate Application Key

```bash
php artisan key:generate
```

### 5. Run Migrations

```bash
php artisan migrate
```

### 6. Seed the Database (Optional)

```bash
php artisan db:seed
```

### 7. Start the Development Server

```bash
php artisan serve
```

### 8. Compile Assets

```bash
npm run dev
```

### 9. Access the Application

## Open your web browser and navigate to `http://localhost:8000` to access the application.

## Contributing

We welcome contributions to Project LNS! Please follow the standard GitHub workflow for contributing:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Commit your changes
5. Push to your fork
6. Create a pull request

---

## License

## This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
