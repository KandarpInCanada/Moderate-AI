# Use Node.js image
FROM node:23-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Build arguments for public environment variables
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_AWS_REGION
ARG NEXT_PUBLIC_AWS_BUCKET_NAME

# Set them as environment variables
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_AWS_REGION=$NEXT_PUBLIC_AWS_REGION
ENV NEXT_PUBLIC_AWS_BUCKET_NAME=$NEXT_PUBLIC_AWS_BUCKET_NAME

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]