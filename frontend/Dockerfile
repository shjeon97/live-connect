# Set the base image
FROM node:latest

# Create and set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# # Build the application
RUN npm run build

# # Serve the application using a static server
RUN npm install -g serve
CMD ["serve", "-s", "build"]
