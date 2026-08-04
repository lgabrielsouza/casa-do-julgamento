package br.org.casadojulgamento.integration.sympla.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import java.time.Duration;

import org.springframework.http.client.JdkClientHttpRequestFactory;

@Configuration
@EnableConfigurationProperties(SymplaProperties.class)
public class SymplaClientConfig {

    @Bean
    public RestClient symplaRestClient(
            RestClient.Builder builder,
            SymplaProperties properties
    ) {
        JdkClientHttpRequestFactory requestFactory =
                new JdkClientHttpRequestFactory();

        requestFactory.setReadTimeout(
                Duration.ofSeconds(30)
        );

        return builder
                .baseUrl(properties.baseUrl())
                .requestFactory(requestFactory)
                .build();
    }
}