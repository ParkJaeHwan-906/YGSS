
# 추천: Amazon Corretto (JDK만 있지만 실행에는 문제없음)
FROM public.ecr.aws/amazoncorretto/amazoncorretto:17

# 더 가벼운 JRE가 필요하면 Microsoft 사용
# FROM mcr.microsoft.com/openjdk/jre:17-ubuntu

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