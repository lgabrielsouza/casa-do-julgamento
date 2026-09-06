package br.org.casadojulgamento.service;

import br.org.casadojulgamento.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class ProfileImageStorageService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final Path storageDirectory;

    public ProfileImageStorageService(
            @Value("${app.storage.profile-images-dir}")
            String profileImagesDir
    ) {
        this.storageDirectory = Path.of(profileImagesDir)
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(this.storageDirectory);
        } catch (IOException e) {
            throw new IllegalStateException(
                    "Não foi possível criar o diretório de fotos de perfil.",
                    e
            );
        }
    }

    public String salvar(MultipartFile arquivo) {
        validarArquivo(arquivo);

        String extensao = obterExtensao(
                arquivo.getContentType()
        );

        String nomeArquivo =
                UUID.randomUUID() + extensao;

        Path destino = storageDirectory
                .resolve(nomeArquivo)
                .normalize();

        if (!destino.startsWith(storageDirectory)) {
            throw new BusinessException(
                    "Caminho de arquivo inválido."
            );
        }

        try {
            Files.copy(
                    arquivo.getInputStream(),
                    destino,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return nomeArquivo;

        } catch (IOException e) {
            throw new BusinessException(
                    "Não foi possível salvar a foto de perfil."
            );
        }
    }

    public void excluir(String nomeArquivo) {
        if (nomeArquivo == null || nomeArquivo.isBlank()) {
            return;
        }

        Path arquivo = storageDirectory
                .resolve(nomeArquivo)
                .normalize();

        if (!arquivo.startsWith(storageDirectory)) {
            throw new BusinessException(
                    "Caminho de arquivo inválido."
            );
        }

        try {
            Files.deleteIfExists(arquivo);
        } catch (IOException e) {
            throw new BusinessException(
                    "Não foi possível excluir a foto de perfil."
            );
        }
    }

    public Path localizar(String nomeArquivo) {
        Path arquivo = storageDirectory
                .resolve(nomeArquivo)
                .normalize();

        if (!arquivo.startsWith(storageDirectory)) {
            throw new BusinessException(
                    "Caminho de arquivo inválido."
            );
        }

        return arquivo;
    }

    private void validarArquivo(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new BusinessException(
                    "Selecione uma imagem."
            );
        }

        if (arquivo.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException(
                    "A imagem deve possuir no máximo 5 MB."
            );
        }

        String contentType = arquivo.getContentType();

        if (contentType == null ||
                !ALLOWED_CONTENT_TYPES.contains(contentType)) {

            throw new BusinessException(
                    "Formato de imagem não permitido. Use JPG, PNG ou WEBP."
            );
        }
    }

    private String obterExtensao(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new BusinessException(
                    "Formato de imagem não permitido."
            );
        };
    }
}