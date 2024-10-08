# Use the official Maven image with Amazon Corretto 17 JDK
# This provides a development environment for building Java applications with Maven and running them on the Amazon Corretto JDK.
FROM maven:3.8.6-amazoncorretto-17 AS build

# Set the working directory inside the container to /app
# This is where all your application files and source code will reside.
WORKDIR /app

# Copy the pom.xml file to the working directory in the container
# The pom.xml contains project dependencies, which are required to be downloaded for the build.
COPY pom.xml .

# Install Maven project dependencies in offline mode
# This command downloads and caches all the dependencies listed in the pom.xml.
# Using '-B' enables batch mode to avoid interactive prompts, which is helpful in automated builds.
RUN mvn dependency:go-offline -B 

# Copy the entire source code from the local 'src' directory to the container
# This will make your application’s source code available inside the container.
COPY src ./src

# Default command to run the Spring Boot application using Maven
# The 'spring-boot:run' goal is used here for development purposes, allowing live reload if dependencies like DevTools are configured.
CMD ["mvn", "spring-boot:run"]
