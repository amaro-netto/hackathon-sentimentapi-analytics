# Etapa 1: Construção (Build) - Agora usando Java 21
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Compila o projeto
RUN mvn clean package -DskipTests

# Etapa 2: Execução (Imagem leve Java 21)
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
# Pega o .jar gerado na etapa anterior
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]