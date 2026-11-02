package com.exploremusic.service.spotify;

import com.exploremusic.service.config.SpotifyProperties;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class SpotifyTokenServiceTest {

    private SpotifyProperties properties() {
        SpotifyProperties properties = new SpotifyProperties();
        properties.setClientId("test-id");
        properties.setClientSecret("test-secret");
        return properties;
    }

    @Test
    void reusesCachedTokenWithinExpiry() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();

        server.expect(requestTo("https://accounts.spotify.com/api/token"))
                .andRespond(withSuccess(
                        "{\"access_token\":\"token-1\",\"expires_in\":3600}", MediaType.APPLICATION_JSON));

        SpotifyTokenService service = new SpotifyTokenService(builder.build(), properties());

        String first = service.getAccessToken();
        String second = service.getAccessToken();

        assertThat(first).isEqualTo("token-1");
        assertThat(second).isEqualTo("token-1");
        server.verify();
    }

    @Test
    void refetchesOnceCachedTokenHasExpired() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();

        server.expect(requestTo("https://accounts.spotify.com/api/token"))
                .andRespond(withSuccess(
                        "{\"access_token\":\"token-1\",\"expires_in\":0}", MediaType.APPLICATION_JSON));
        server.expect(requestTo("https://accounts.spotify.com/api/token"))
                .andRespond(withSuccess(
                        "{\"access_token\":\"token-2\",\"expires_in\":3600}", MediaType.APPLICATION_JSON));

        SpotifyTokenService service = new SpotifyTokenService(builder.build(), properties());

        String first = service.getAccessToken();
        String second = service.getAccessToken();

        assertThat(first).isEqualTo("token-1");
        assertThat(second).isEqualTo("token-2");
        server.verify();
    }
}
