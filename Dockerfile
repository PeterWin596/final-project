FROM php:8.1-cli

# Install any PHP extensions you need
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Copy your project files to the container
COPY . /app

# Set the working directory
WORKDIR /app

# Expose port 8080 for Render
EXPOSE 8080

# Start the PHP built-in server
CMD ["php", "-S", "0.0.0.0:8080", "index.php"]
