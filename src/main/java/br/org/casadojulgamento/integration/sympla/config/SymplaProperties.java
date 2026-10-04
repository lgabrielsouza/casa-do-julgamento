package br.org.casadojulgamento.integration.sympla.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "integrations.sympla")
public record SymplaProperties(

        String baseUrl,

        String token

) {

    public SymplaProperties {
        if (baseUrl == null || baseUrl.isBlank()) {
            baseUrl = "https://api.sympla.com.br/public";
        }
    }

    public boolean hasToken() {
        return token != null && !token.isBlank();
    }
}