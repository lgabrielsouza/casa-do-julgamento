package br.org.casadojulgamento.api.controller;

import br.org.casadojulgamento.api.dto.user.CreateUserRequest;
import br.org.casadojulgamento.api.dto.user.UserResponse;
import br.org.casadojulgamento.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @GetMapping
    public List<UserResponse> listarTodos() {
        return userService.listarTodos();
    }

    @GetMapping("/{id}")
    public UserResponse buscarPorId(@PathVariable Long id) {
        return userService.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse criar(
            @Valid @RequestBody CreateUserRequest request
    ) {
        return userService.criar(request);
    }
}