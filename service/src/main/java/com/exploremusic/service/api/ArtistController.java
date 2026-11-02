package com.exploremusic.service.api;

import com.exploremusic.service.spotify.SpotifyClient;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ArtistController {

    private final SpotifyClient spotifyClient;

    public ArtistController(SpotifyClient spotifyClient) {
        this.spotifyClient = spotifyClient;
    }

    @GetMapping("/artists")
    public JsonNode getArtistsByGenre(@RequestParam String genre, @RequestParam(defaultValue = "12") int limit) {
        return spotifyClient.searchArtistsByGenre(genre, limit);
    }

    @GetMapping("/genres")
    public JsonNode getAvailableGenres() {
        return spotifyClient.getAvailableGenres();
    }

    @GetMapping("/artists/{artistId}")
    public JsonNode getArtist(@PathVariable String artistId) {
        return spotifyClient.getArtist(artistId);
    }

    @GetMapping("/artists/{artistId}/top-tracks")
    public JsonNode getArtistTopTracks(@PathVariable String artistId,
            @RequestParam(defaultValue = "US") String market) {
        return spotifyClient.getArtistTopTracks(artistId, market);
    }

    @GetMapping("/artists/{artistId}/related-artists")
    public JsonNode getRelatedArtists(@PathVariable String artistId) {
        return spotifyClient.getRelatedArtists(artistId);
    }
}
