# Use the official Apache HTTP Server image
FROM httpd:2.4

# Copy the content of the local directory (with your HTML, CSS, JS files) to the web directory in the container
COPY ./ /usr/local/apache2/htdocs/

# Expose the port Apache is listening on
EXPOSE 80
