# Use the official PHP image
FROM php:8.1-apache

# Copy your project files to the Apache document root
COPY . /var/www/html/

# Set permissions for the Apache server
RUN chown -R www-data:www-data /var/www/html && chmod -R 755 /var/www/html

# Expose port 8080
EXPOSE 8080

# Start the Apache server
CMD ["apache2-foreground"]
