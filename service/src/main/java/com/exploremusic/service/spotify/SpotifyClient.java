package com.exploremusic.service.spotify;

import com.exploremusic.service.config.SpotifyProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * Thin wrapper around the Spotify Web API. Mirrors the functions that
 * previously lived in the frontend's src/services/spotify.js, returning
 * Spotify's JSON unmodified (unwrapped to the same arrays/objects the
 * frontend already expects) rather than reshaping it into custom DTOs.
 */
@Component
public class SpotifyClient {

    private static final String API_BASE = "https://api.spotify.com/v1";

    private final RestClient restClient;
    private final SpotifyTokenService tokenService;
    private final SpotifyProperties properties;
    private final ObjectMapper objectMapper;

    public SpotifyClient(RestClient restClient, SpotifyTokenService tokenService,
            SpotifyProperties properties, ObjectMapper objectMapper) {
        this.restClient = restClient;
        this.tokenService = tokenService;
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    public JsonNode searchArtistsByGenre(String genre, int limit) {
        String query = "genre:\"" + genre + "\"";
        URI uri = UriComponentsBuilder.fromUriString(API_BASE + "/search")
                .queryParam("q", query)
                .queryParam("type", "artist")
                .queryParam("limit", limit)
                .queryParam("market", properties.getMarket())
                .encode()
                .build()
                .toUri();
        JsonNode data = get(uri);
        return at(data, "artists", "items");
    }

    public JsonNode getAvailableGenres() {
        JsonNode data = get(URI.create(API_BASE + "/recommendations/available-genre-seeds"));
        return at(data, "genres");
    }

    public JsonNode getArtist(String artistId) {
        return get(URI.create(API_BASE + "/artists/" + artistId));
    }

    public JsonNode getArtistTopTracks(String artistId, String market) {
        JsonNode data = get(URI.create(API_BASE + "/artists/" + artistId + "/top-tracks?market=" + market));
        return at(data, "tracks");
    }

    public JsonNode getRelatedArtists(String artistId) {
        JsonNode data = get(URI.create(API_BASE + "/artists/" + artistId + "/related-artists"));
        return at(data, "artists");
    }

    /** Pass a pre-built {@link URI} (not a String) so RestClient uses it as-is instead of re-encoding it. */
    private JsonNode get(URI uri) {
        return restClient.get()
                .uri(uri)
                .header("Authorization", "Bearer " + tokenService.getAccessToken())
                .retrieve()
                .body(JsonNode.class);
    }

    /** Navigate to a nested field, falling back to an empty array if missing. */
    private JsonNode at(JsonNode node, String... path) {
        JsonNode current = node;
        for (String field : path) {
            if (current == null) break;
            current = current.get(field);
        }
        return current != null ? current : objectMapper.createArrayNode();
    }
}
