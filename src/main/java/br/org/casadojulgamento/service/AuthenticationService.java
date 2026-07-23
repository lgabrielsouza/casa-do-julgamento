package br.org.casadojulgamento.service;

import br.org.casadojulgamento.api.dto.auth.LoginRequest;
import br.org.casadojulgamento.api.dto.auth.LoginResponse;
import br.org.casadojulgamento.exception.BusinessException;
import br.org.casadojulgamento.security.jwt.JwtService;
import br.org.casadojulgamento.security.service.SecurityUser;
import br.org.casadojulgamento.security.service.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserDetailsServiceImpl userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {

        SecurityUser user;

        try {
            user = (SecurityUser) userDetailsService.loadUserByUsername(
                    request.email().trim().toLowerCase()
            );
        } catch (UsernameNotFoundException ex) {
            throw new BusinessException("E-mail ou senha inválidos.");
        }

        if (!passwordEncoder.matches(
                request.senha(),
                user.getPassword())) {

            throw new BusinessException("E-mail ou senha inválidos.");
        }

        String token = jwtService.generateToken(user);

        return new LoginResponse(
                token,
                user.getUser().getId(),
                user.getUser().getNome(),
                user.getUser().getEmail(),
                user.getUser().getRole()
        );
    }
}