package br.org.casadojulgamento.service;

import br.org.casadojulgamento.api.dto.auth.LoginRequest;
import br.org.casadojulgamento.api.dto.auth.LoginResponse;
import br.org.casadojulgamento.security.jwt.JwtService;
import br.org.casadojulgamento.security.service.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        String emailNormalizado = request.email()
                .trim()
                .toLowerCase();

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                emailNormalizado,
                                request.senha()
                        )
                );

        SecurityUser securityUser =
                (SecurityUser) authentication.getPrincipal();

        String token = jwtService.generateToken(securityUser);

        return new LoginResponse(
                token,
                securityUser.getUser().getId(),
                securityUser.getUser().getNome(),
                securityUser.getUser().getEmail(),
                securityUser.getUser().getRole()
        );
    }
}