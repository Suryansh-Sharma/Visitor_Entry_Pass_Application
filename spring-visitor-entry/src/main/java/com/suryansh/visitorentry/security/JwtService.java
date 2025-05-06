package com.suryansh.visitorentry.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtService {

    @Value("${secret_Key}")
    private String SECRET;

    @Value("${expiration_time}")
    private long EXPIRE_TIME;

    public String generateToken(String userId,
                                Map<String, Object> claims) {
        ZonedDateTime nowInIndia = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
        ZonedDateTime expirationTime = nowInIndia.plusMinutes(EXPIRE_TIME);

        return Jwts
                .builder()
                .claims(claims)
                .subject(userId)  // Subject is the userId
                .issuedAt(Date.from(nowInIndia.toInstant()))  // Issue time in India timezone
                .expiration(Date.from(expirationTime.toInstant()))  // Set the expiration date
                .signWith(getSignInKey(),Jwts.SIG.HS256)
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    private  <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUserId(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    private Boolean isTokenExpired(String token) {
        return extractClaim(token,Claims::getExpiration)
                .before(new Date());
    }

    public Boolean validateToken(String token, String id) {
        final String userId = extractUserId(token);
        return userId.equals(id) && !isTokenExpired(token);
    }
}
