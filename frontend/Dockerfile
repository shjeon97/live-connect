# Set the base image
FROM node:16

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

# # Run the application
CMD ["npm", "start"]