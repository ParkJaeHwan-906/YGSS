FROM ygss-ai-base:latest

COPY . /app/

RUN mkdir -p /app/saved_models && \
    chown -R appuser:appuser /app && \
    chmod 755 /app/saved_models

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=30s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health/ || exit 1

CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]