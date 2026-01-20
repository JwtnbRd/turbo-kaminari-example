# Ruby 3.3 Base Image
FROM ruby:3.3-slim

# Install system dependencies
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    postgresql-client \
    nodejs \
    npm \
    git \
    curl \
    libyaml-dev \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Copy Gemfile and Gemfile.lock
COPY Gemfile Gemfile.lock ./

# Configure bundler for development
RUN bundle config set --local path 'vendor/bundle'

# Install Ruby dependencies
RUN bundle install --jobs 4 --retry 3

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p tmp/pids tmp/sockets log

# Set permissions
RUN chown -R 1000:1000 /app

# Switch to non-root user
USER 1000:1000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/rails/health || exit 1

# Default command
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "3000"]