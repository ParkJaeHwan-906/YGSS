FROM eclipse-temurin:17-jre
WORKDIR /app
COPY build/libs/backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", \
    "-Xmx2g", \
    "-Xms512m", \
    "-XX:+UseG1GC", \
    "-XX:G1HeapRegionSize=16m", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=70.0", \
    "-XX:+OptimizeStringConcat", \
    "-XX:+UseStringDeduplication", \
    "-Dspring.profiles.active=prod", \
    "-jar", "app.jar"]