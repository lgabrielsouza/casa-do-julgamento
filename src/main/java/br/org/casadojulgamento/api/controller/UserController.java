package br.org.casadojulgamento.api.controller;

import br.org.casadojulgamento.api.dto.user.CreateUserRequest;
import br.org.casadojulgamento.api.dto.user.UserResponse;
import br.org.casadojulgamento.security.service.SecurityUser;
import br.org.casadojulgamento.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import br.org.casadojulgamento.api.dto.user.UpdateUserRequest;
import br.org.casadojulgamento.security.service.SecurityUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;
import br.org.casadojulgamento.api.dto.user.ResetUserPasswordRequest;

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

    @PutMapping("/{id}")
    public UserResponse atualizar(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal SecurityUser usuarioLogado
    ) {
        return userService.atualizar(
                id,
                request,
                usuarioLogado.getUser().getId()
        );
    }

    @PatchMapping("/{id}/status")
    public UserResponse alterarStatus(
            @PathVariable Long id,
            @RequestParam boolean ativo,
            @AuthenticationPrincipal SecurityUser usuarioLogado
    ) {
        return userService.alterarStatus(
                id,
                ativo,
                usuarioLogado.getUser().getId()
        );
    }

    @PatchMapping("/{id}/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void redefinirSenha(
            @PathVariable Long id,
            @Valid @RequestBody ResetUserPasswordRequest request
    ) {
        userService.redefinirSenha(id, request);
    }

}