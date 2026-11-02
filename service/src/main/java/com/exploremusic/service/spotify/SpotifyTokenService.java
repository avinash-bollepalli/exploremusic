package com.exploremusic.service.spotify;

import com.exploremusic.service.config.SpotifyProperties;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

/**
 * Fetches and caches a Spotify Client Credentials access token.
 * Mirrors the cache/expiry semantics of the original browser-side
 * implementation: reuse the cached token until (expires_in - 60s) has
 * elapsed, then re-fetch.
 */
@Service
public class SpotifyTokenService {

    private static final String TOKEN_URL = "https://accounts.spotify.com/api/token";

    private final RestClient restClient;
    private final SpotifyProperties properties;

    private String cachedToken;
    private long tokenExpiryEpochMillis;

    public SpotifyTokenService(RestClient restClient, SpotifyProperties properties) {
        this.restClient = restClient;
        this.properties = properties;
    }

    public synchronized String getAccessToken() {
        if (cachedToken != null && System.currentTimeMillis() < tokenExpiryEpochMillis) {
            return cachedToken;
        }

        String credentials = Base64.getEncoder().encodeToString(
                (properties.getClientId() + ":" + properties.getClientSecret()).getBytes(StandardCharsets.UTF_8));

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restClient.post()
                .uri(TOKEN_URL)
                .header("Authorization", "Basic " + credentials)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body("grant_type=client_credentials")
                .retrieve()
                .body(Map.class);

        cachedToken = (String) response.get("access_token");
        int expiresIn = ((Number) response.get("expires_in")).intValue();
        tokenExpiryEpochMillis = System.currentTimeMillis() + (expiresIn - 60) * 1000L;

        return cachedToken;
    }
}
