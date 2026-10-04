package br.org.casadojulgamento.api.controller;

import br.org.casadojulgamento.api.dto.auth.LoginRequest;
import br.org.casadojulgamento.api.dto.auth.LoginResponse;
import br.org.casadojulgamento.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request
    ) {
        return authenticationService.login(request);
    }
}