package com.ygss.backend.global.redis;

import com.ygss.backend.chatbot.dto.SearchResultDto;
import org.springframework.stereotype.Component;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.resps.ScanResult;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class VectorRepository {
    private final Jedis jedis;

    public VectorRepository(Jedis jedis) { this.jedis = jedis; }

    private byte[] toBytes(float[] vector) {
        ByteBuffer buffer = ByteBuffer.allocate(vector.length * 4);
        for (float v : vector) {
            buffer.putFloat(v);
        }
        buffer.flip();
        byte[] bytes = new byte[buffer.remaining()];
        buffer.get(bytes);

        return bytes;
    }

    public float[] fromBytes(byte[] bytes) {
        ByteBuffer buffer = ByteBuffer.wrap(bytes);
        float[] floats = new float[bytes.length / 4];
        for (int i = 0; i < floats.length; i++) {
            floats[i] = buffer.getFloat();
        }
        return floats;
    }

    public void saveVectorChunk(String prefix, Long termId, Long id, String type, float[] embedding) {
        String key = prefix + ":" + termId + ":" + id + ":" + type; // type: "Q" 또는 "A"
        jedis.rpush(key.getBytes(), toBytes(embedding));
    }


    public static double cosineSimilarity(float[] a, float[] b) {
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     *
     * @param queryVector
     * : 사용자의 질의를 임베딩한 값
     * @param k
     * : Top K
     * @return
     * : 유사도가 높은 K 개의 id 를 반환
     */
    public List<SearchResultDto> searchAllPrefixes(float[] queryVector, int k) {
        PriorityQueue<SearchResultDto> pq =
                new PriorityQueue<>(Comparator.comparingDouble(SearchResultDto::getSimilarity));

        String cursor = "0";
        do {
            ScanResult<String> scanResult = jedis.scan(cursor);
            for (String key : scanResult.getResult()) {
                if (!"list".equalsIgnoreCase(jedis.type(key))) continue;

                // key 구조: prefix:termId:id:type
                String[] parts = key.split(":");
                if (parts.length < 4) continue; // type까지 포함
                String prefix = parts[0];
                Long termId, id;
                String type = parts[3].toUpperCase(); // DTO에 표시할 type
                try {
                    termId = Long.parseLong(parts[1]);
                    id = Long.parseLong(parts[2]);
                } catch (NumberFormatException e) {
                    continue;
                }

                // 모든 embedding 조회 (Q/A 구분 없이)
                List<byte[]> allEmbeddings = jedis.lrange(key.getBytes(), 0, -1);
                for (byte[] value : allEmbeddings) {
                    float[] vec = fromBytes(value);
                    double sim = cosineSimilarity(queryVector, vec);
                    if(sim < 0.25) continue;
                    pq.offer(new SearchResultDto(prefix, termId, id, type, sim));

                    if (pq.size() > k) pq.poll();
                }
            }
            cursor = scanResult.getCursor();
        } while (!"0".equals(cursor));

        List<SearchResultDto> result = new ArrayList<>();
        while (!pq.isEmpty()) {
            result.add(0, pq.poll());
        }
        return result;
    }
}