package br.org.casadojulgamento.api.controller;

import br.org.casadojulgamento.api.dto.CreateRegistrationRequest;
import br.org.casadojulgamento.api.dto.RegistrationResponse;
import br.org.casadojulgamento.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RegistrationResponse create(@Valid @RequestBody CreateRegistrationRequest request) {
        return registrationService.create(request);
    }
}
