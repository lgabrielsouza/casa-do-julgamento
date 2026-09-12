package br.org.casadojulgamento.config;

import br.org.casadojulgamento.security.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                /*
                 * A aplicação usa JWT stateless enviado pelo
                 * header Authorization.
                 *
                 * Enquanto o token não estiver em cookie,
                 * o CSRF permanece desabilitado.
                 */
                .csrf(csrf ->
                        csrf.disable()
                )

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        /*
                         * Recursos públicos.
                         */
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/favicon.ico",
                                "/error",
                                "/css/**",
                                "/js/**",
                                "/assets/**",
                                "/.well-known/**",
                                "/api/auth/login"
                        )
                        .permitAll()

                        /*
                         * Perfil do próprio usuário.
                         *
                         * Qualquer usuário autenticado pode
                         * consultar e editar o próprio perfil.
                         */
                        .requestMatchers(
                                "/api/me",
                                "/api/me/**"
                        )
                        .authenticated()

                        /*
                         * Administração de usuários.
                         *
                         * Somente ADMIN.
                         */
                        .requestMatchers(
                                "/api/users",
                                "/api/users/**"
                        )
                        .hasRole("ADMIN")

                        /*
                         * Integração Sympla.
                         *
                         * ADMIN e COORDENADOR.
                         */
                        .requestMatchers(
                                "/api/integrations/sympla",
                                "/api/integrations/sympla/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "COORDENADOR"
                        )

                        /*
                         * Área operacional do evento.
                         *
                         * Os quatro perfis atualmente
                         * autorizados no sistema podem utilizar
                         * esses endpoints.
                         */
                        .requestMatchers(
                                "/api/events",
                                "/api/events/**",
                                "/api/sessions",
                                "/api/sessions/**",
                                "/api/participants",
                                "/api/participants/**",
                                "/api/groups",
                                "/api/groups/**",
                                "/api/reception",
                                "/api/reception/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "COORDENADOR",
                                "LIDER",
                                "RECEPCAO"
                        )

                        /*
                         * Segurança por padrão.
                         *
                         * Qualquer endpoint que não tenha sido
                         * explicitamente liberado acima fica
                         * bloqueado.
                         */
                        .anyRequest()
                        .denyAll()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        /*
         * Ambiente local.
         *
         * A origem de produção será configurada
         * separadamente por variável de ambiente
         * no bloco de configuração de produção.
         */
        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type"
                )
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    @Bean
    AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration
                .getAuthenticationManager();
    }
}