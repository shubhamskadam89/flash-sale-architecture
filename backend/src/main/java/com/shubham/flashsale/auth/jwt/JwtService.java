package com.shubham.flashsale.auth.jwt;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import java.time.Instant;


@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;
    private final JwtProperties jwtProperties;

    public String generateToken(UserDetails principal) {
        Instant now = Instant.now();
        JwtClaimsSet claimsSet = JwtClaimsSet.builder()
                .subject(principal.getUsername())
                .issuedAt(now)
                .expiresAt(now.plusMillis(jwtProperties.getExpiration()))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();

        return jwtEncoder.encode(JwtEncoderParameters.from(header, claimsSet)).getTokenValue();
    }

    public String extractUsername(String token) {
        return jwtDecoder.decode(token).getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        Jwt jwt = jwtDecoder.decode(token);
        return jwt.getSubject().equals(userDetails.getUsername());
    }
}