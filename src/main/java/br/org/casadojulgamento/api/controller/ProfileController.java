package br.org.casadojulgamento.api.controller;

import br.org.casadojulgamento.api.dto.user.ChangeMyPasswordRequest;
import br.org.casadojulgamento.api.dto.user.UpdateMyProfileRequest;
import br.org.casadojulgamento.api.dto.user.UserResponse;
import br.org.casadojulgamento.exception.ResourceNotFoundException;
import br.org.casadojulgamento.security.service.SecurityUser;
import br.org.casadojulgamento.service.ProfileImageStorageService;
import br.org.casadojulgamento.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;
    private final ProfileImageStorageService profileImageStorageService;

    @GetMapping
    public UserResponse buscarMeuPerfil(
            @AuthenticationPrincipal SecurityUser usuarioLogado
    ) {
        return userService.buscarPorId(
                usuarioLogado.getUser().getId()
        );
    }

    @PutMapping
    public UserResponse atualizarMeuPerfil(
            @Valid @RequestBody UpdateMyProfileRequest request,
            @AuthenticationPrincipal SecurityUser usuarioLogado
    ) {
        return userService.atualizarMeuPerfil(
                usuarioLogado.getUser().getId(),
                request
        );
    }

    @PatchMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void alterarMinhaSenha(
            @Valid @RequestBody ChangeMyPasswordRequest request,
            @AuthenticationPrincipal SecurityUser usuarioLogado
    ) {
        userService.alterarMinhaSenha(
                usuarioLogado.getUser().getId(),
                request
        );
    }

    @PatchMapping(
            value = "/photo",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public UserResponse atualizarFotoPerfil(
            @RequestPart("file") MultipartFile arquivo,
            @AuthenticationPrincipal SecurityUser usuarioLogado
    ) {
        return userService.atualizarFotoPerfil(
                usuarioLogado.getUser().getId(),
                arquivo
        );
    }

    @GetMapping("/photo")
    public ResponseEntity<Resource> buscarFotoPerfil(
            @AuthenticationPrincipal SecurityUser usuarioLogado
    ) {
        UserResponse usuario = userService.buscarPorId(
                usuarioLogado.getUser().getId()
        );

        if (usuario.fotoPerfil() == null ||
                usuario.fotoPerfil().isBlank()) {
            throw new ResourceNotFoundException(
                    "Foto de perfil não encontrada."
            );
        }

        Path arquivo = profileImageStorageService.localizar(
                usuario.fotoPerfil()
        );

        if (!Files.exists(arquivo) ||
                !Files.isRegularFile(arquivo)) {
            throw new ResourceNotFoundException(
                    "Foto de perfil não encontrada."
            );
        }

        Resource resource = new FileSystemResource(arquivo);

        MediaType mediaType = obterMediaType(
                usuario.fotoPerfil()
        );

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(resource);
    }

    @DeleteMapping("/photo")
    public UserResponse removerFotoPerfil(
            @AuthenticationPrincipal SecurityUser usuarioLogado
    ) {
        return userService.removerFotoPerfil(
                usuarioLogado.getUser().getId()
        );
    }

    private MediaType obterMediaType(String nomeArquivo) {
        String nome = nomeArquivo.toLowerCase();

        if (nome.endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        }

        if (nome.endsWith(".webp")) {
            return MediaType.parseMediaType(
                    "image/webp"
            );
        }

        return MediaType.IMAGE_JPEG;
    }
}