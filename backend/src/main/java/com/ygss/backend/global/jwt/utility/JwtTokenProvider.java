package com.ygss.backend.global.jwt.utility;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {
    @Value("${jwt.access-token-expiration}")
    private long accessTokenExp;
    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExp;

    private final Key key;
    public JwtTokenProvider(@Value("${jwt.secret}") String secretKey) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
    }


    public String generateAccessToken(Long userAccountId, String userEmail, String userName) {
        return Jwts.builder()
                .setSubject(userEmail)
                .claim("type", "access")
                .claim("userAccountId", userAccountId)
                .claim("userEmail", userEmail)
                .claim("userName", userName)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis()+accessTokenExp))
                .signWith(key)
                .compact();
    }

    public String generateRefreshToken(Long userAccountId, String userEmail, String userName) {
        return Jwts.builder()
                .setSubject(userEmail)
                .claim("type", "refresh")
                .claim("userAccountId", userAccountId)
                .claim("userEmail", userEmail)
                .claim("userName", userName)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis()+refreshTokenExp))
                .signWith(key)
                .compact();
    }

    public Claims getClaims(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            log.error("토큰 만료 : {}", e.getMessage());
            throw new JwtException("Token Expired");
        } catch (JwtException e) {
            log.error("토큰 검증 실패 : {}", e.getMessage());
            throw new JwtException("Token Invalid");
        }
    }

    public Long getUserAccountId(String token) {
        Claims claims = getClaims(token);
        return claims.get("userAccountId", Long.class);
    }

    public String getUserEmail(String token) {
        Claims claims = getClaims(token);
        return claims.get("userEmail", String.class);
    }

    public String getUserName(String token) {
        Claims claims = getClaims(token);
        return claims.get("userName", String.class);
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
