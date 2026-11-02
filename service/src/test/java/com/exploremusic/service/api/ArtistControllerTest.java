package com.exploremusic.service.api;

import com.exploremusic.service.spotify.SpotifyClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ArtistController.class)
class ArtistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SpotifyClient spotifyClient;

    @Test
    void returnsSpotifyArtistJsonUnmodified() throws Exception {
        JsonNode artists = objectMapper.readTree(
                "[{\"id\":\"1\",\"name\":\"Example\",\"followers\":{\"total\":42}}]");
        when(spotifyClient.searchArtistsByGenre(eq("jazz"), eq(12))).thenReturn(artists);

        mockMvc.perform(get("/api/artists").param("genre", "jazz").param("limit", "12"))
                .andExpect(status().isOk())
                .andExpect(content().json(
                        "[{\"id\":\"1\",\"name\":\"Example\",\"followers\":{\"total\":42}}]"));
    }

    @Test
    void defaultsLimitToTwelve() throws Exception {
        when(spotifyClient.searchArtistsByGenre(any(), eq(12))).thenReturn(objectMapper.createArrayNode());

        mockMvc.perform(get("/api/artists").param("genre", "rock"))
                .andExpect(status().isOk());
    }
}
