package br.org.casadojulgamento.security.jwt;

import br.org.casadojulgamento.security.service.SecurityUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    @Value("${security.jwt.secret}")
    private String secret;

    @Value("${security.jwt.expiration-ms}")
    private long expiration;

    private SecretKey key;

    @PostConstruct
    public void init() {
        key = Keys.hmacShaKeyFor(secret.getBytes());
    }

   public String generateToken(SecurityUser user) {

    Date now = new Date();

    Date expirationDate =
            new Date(now.getTime() + expiration);

    return Jwts.builder()
            .subject(user.getUsername())
            .claim(
                    "role",
                    user.getUser()
                            .getRole()
                            .name()
            )
            .claim(
                    "tokenVersion",
                    user.getUser()
                            .getTokenVersion()
            )
            .issuedAt(now)
            .expiration(expirationDate)
            .signWith(key)
            .compact();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public boolean isTokenValid(
            String token,
            SecurityUser user
    ) {

        Claims claims = extractClaims(token);

        Integer tokenVersion =
                claims.get(
                        "tokenVersion",
                        Integer.class
                );

        return claims.getSubject()
                .equals(user.getUsername())
                && !claims.getExpiration()
                        .before(new Date())
                && tokenVersion != null
                && tokenVersion.equals(
                        user.getUser()
                                .getTokenVersion()
                );
    }

    private boolean isExpired(String token) {

        return extractClaims(token)
                .getExpiration()
                .before(new Date());

    }

    private Claims extractClaims(String token) {

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

    }

}