FROM avalancheplatform/avalanchego:v1.13.5

RUN apt-get update && apt-get install -y zstd curl && rm -rf /var/lib/apt/lists/*
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
