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
    private static final String SPLIT_REGEX = "[.!?\\n]+";
    private static final String REMOVE_CHARS_REGEX = "[\"'`]";
    private static final int MIN_SENTENCE_LENGTH = 15;
    private static final int MAX_CHARS = 200;
    public VectorRepository(Jedis jedis) { this.jedis = jedis; }

    // chunk 나누기
//    public List<String> seperateChunk(String text) {
//        List<String> chunks = new ArrayList<>();
//        text = text.replaceAll(REMOVE_CHARS_REGEX, "");
//        List<String> sentences = splitBySentence(text);
//        StringBuilder currentChunk = new StringBuilder();
//
//        for (String sentence : sentences) {
//            sentence = sentence.trim();
//            if (sentence.isEmpty()) continue;
//
//            if (sentence.length() < MIN_SENTENCE_LENGTH) {
//                if (currentChunk.length() + sentence.length() <= MAX_CHARS) {
//                    currentChunk.append(sentence).append(" ");
//                } else {
//                    if (!currentChunk.isEmpty()) {
//                        chunks.add(currentChunk.toString().trim());
//                    }
//                    currentChunk = new StringBuilder(sentence).append(" ");
//                }
//            } else {
//                if (!currentChunk.isEmpty()) {
//                    chunks.add(currentChunk.toString().trim());
//                    currentChunk = new StringBuilder();
//                }
//                chunks.add(sentence);
//            }
//        }
//
//        if (!currentChunk.isEmpty()) {
//            chunks.add(currentChunk.toString().trim());
//        }
//        return chunks;
//    }

//    private static List<String> splitBySentence(String text) {
//        String[] split = text.split(SPLIT_REGEX);
//        List<String> sentences = new ArrayList<>();
//        for (String s : split) {
//            if (!s.trim().isEmpty()) {
//                sentences.add(s.trim());
//            }
//        }
//        return sentences;
//    }
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

    public void saveVectorChunk(String prefix, Long id, float[] embedding) {
        String counterKey = prefix + ":" + id + ":counter";
        String hashKey = prefix + ":" + id;

        long fieldIndex = jedis.incr(counterKey);
        jedis.hset(hashKey.getBytes(),
                String.valueOf(fieldIndex).getBytes(),
                toBytes(embedding));
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
                if (key.endsWith(":counter")) continue;
                if (!"hash".equalsIgnoreCase(jedis.type(key))) continue;

                String[] parts = key.split(":");
                if (parts.length < 2) continue;
                String prefix = parts[0];
                Long id;
                try {
                    id = Long.parseLong(parts[1]);
                } catch (NumberFormatException e) {
                    continue;
                }

                Map<byte[], byte[]> allEmbeddings = jedis.hgetAll(key.getBytes());
                for (Map.Entry<byte[], byte[]> entry : allEmbeddings.entrySet()) {
                    String field = new String(entry.getKey(), StandardCharsets.UTF_8);
                    if ("counter".equals(field)) continue;

                    float[] vec = fromBytes(entry.getValue());
                    double sim = cosineSimilarity(queryVector, vec);
                    pq.offer(new SearchResultDto(prefix, id, sim));

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