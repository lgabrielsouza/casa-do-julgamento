package br.org.casadojulgamento.config;

import br.org.casadojulgamento.domain.entity.User;
import br.org.casadojulgamento.domain.enums.UserRole;
import br.org.casadojulgamento.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "app.bootstrap.admin.enabled",
        havingValue = "true"
)
public class ProductionAdminBootstrap implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value(
            "${app.bootstrap.admin.name:}"
    )
    private String adminName;

    @org.springframework.beans.factory.annotation.Value(
            "${app.bootstrap.admin.email:}"
    )
    private String adminEmail;

    @org.springframework.beans.factory.annotation.Value(
            "${app.bootstrap.admin.password:}"
    )
    private String adminPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {

        validarConfiguracao();

        String emailNormalizado = adminEmail
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(emailNormalizado)) {
            System.out.println(
                    "Bootstrap ADMIN: usuário já existe. Nenhuma alteração realizada."
            );
            return;
        }

        User admin = User.builder()
                .nome(adminName.trim())
                .email(emailNormalizado)
                .senha(passwordEncoder.encode(adminPassword))
                .role(UserRole.ADMIN)
                .ativo(true)
                .tokenVersion(0)
                .build();

        userRepository.saveAndFlush(admin);

        System.out.println(
                "Bootstrap ADMIN: administrador inicial criado com sucesso."
        );
    }

    private void validarConfiguracao() {

        if (adminName == null || adminName.isBlank()) {
            throw new IllegalStateException(
                    "BOOTSTRAP_ADMIN_NAME não foi informado."
            );
        }

        if (adminEmail == null || adminEmail.isBlank()) {
            throw new IllegalStateException(
                    "BOOTSTRAP_ADMIN_EMAIL não foi informado."
            );
        }

        if (adminPassword == null || adminPassword.isBlank()) {
            throw new IllegalStateException(
                    "BOOTSTRAP_ADMIN_PASSWORD não foi informado."
            );
        }

        if (adminPassword.length() < 8) {
            throw new IllegalStateException(
                    "A senha inicial do ADMIN deve possuir pelo menos 8 caracteres."
            );
        }
    }
}