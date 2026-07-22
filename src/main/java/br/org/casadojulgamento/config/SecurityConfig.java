package br.org.casadojulgamento.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth
                    .requestMatchers(
                        "/",
                        "/index.html",
                        "/favicon.ico",
                        "/error",
                        "/css/**",
                        "/js/**",
                        "/assets/**",
                        "/.well-known/**",
                        "/api/registrations",
                        "/api/tickets/qr/**"
                    ).permitAll()

                    .requestMatchers("/h2-console/**").permitAll()

                    .anyRequest().authenticated()
                )

            .httpBasic(Customizer.withDefaults())

            .headers(headers ->
                headers.frameOptions(frame ->
                    frame.sameOrigin()
                )
            );

        return http.build();
    }
}