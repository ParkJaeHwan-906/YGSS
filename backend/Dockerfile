# 추천: Amazon ECR Public (로그인 불필요, 가벼움)
FROM public.ecr.aws/amazoncorretto/amazoncorretto:17-jre

# 옵션 2: Microsoft Container Registry (로그인 불필요)
# FROM mcr.microsoft.com/openjdk/jdk:17-ubuntu

# 옵션 3: Red Hat 레지스트리 (무겁지만 안정적)
# FROM registry.access.redhat.com/ubi8/openjdk-17-runtime

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
    "-Duser.timezone=Asia/Seoul", \
    "-jar", "app.jar"]