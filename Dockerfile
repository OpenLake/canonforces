# Use the official Node.js 20 image as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Set environment variables for build
ENV NEXT_PUBLIC_FIREBASE_API_KEY=test-key
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=test.firebaseapp.com
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=test-project
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=test.appspot.com
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456
ENV NEXT_PUBLIC_FIREBASE_APP_ID=test-app
ENV NEXT_PUBLIC_GEMINI_API_KEY=test-key

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]