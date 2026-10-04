package br.org.casadojulgamento.service;

import br.org.casadojulgamento.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ProfileImageStorageService {

    private static final long MAX_FILE_SIZE =
            5L * 1024 * 1024;

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

        TipoImagem tipoImagem =
                validarArquivoEIdentificarTipo(arquivo);

        String nomeArquivo =
                UUID.randomUUID()
                        + tipoImagem.getExtensao();

        Path destino = storageDirectory
                .resolve(nomeArquivo)
                .normalize();

        validarCaminho(destino);

        try (InputStream inputStream =
                     arquivo.getInputStream()) {

            Files.copy(
                    inputStream,
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

        if (nomeArquivo == null ||
                nomeArquivo.isBlank()) {
            return;
        }

        Path arquivo = storageDirectory
                .resolve(nomeArquivo)
                .normalize();

        validarCaminho(arquivo);

        try {
            Files.deleteIfExists(arquivo);

        } catch (IOException e) {
            throw new BusinessException(
                    "Não foi possível excluir a foto de perfil."
            );
        }
    }

    public Path localizar(String nomeArquivo) {

        if (nomeArquivo == null ||
                nomeArquivo.isBlank()) {

            throw new BusinessException(
                    "Arquivo de imagem inválido."
            );
        }

        Path arquivo = storageDirectory
                .resolve(nomeArquivo)
                .normalize();

        validarCaminho(arquivo);

        return arquivo;
    }

    private TipoImagem validarArquivoEIdentificarTipo(
            MultipartFile arquivo
    ) {

        if (arquivo == null ||
                arquivo.isEmpty()) {

            throw new BusinessException(
                    "Selecione uma imagem."
            );
        }

        if (arquivo.getSize() > MAX_FILE_SIZE) {

            throw new BusinessException(
                    "A imagem deve possuir no máximo 5 MB."
            );
        }

        TipoImagem tipoImagem =
                identificarTipoReal(arquivo);

        if (tipoImagem == null) {

            throw new BusinessException(
                    "Formato de imagem não permitido. Use JPG, PNG ou WEBP."
            );
        }

        return tipoImagem;
    }

    private TipoImagem identificarTipoReal(
            MultipartFile arquivo
    ) {

        byte[] cabecalho = new byte[12];

        int bytesLidos;

        try (InputStream inputStream =
                     arquivo.getInputStream()) {

            bytesLidos = inputStream.read(cabecalho);

        } catch (IOException e) {

            throw new BusinessException(
                    "Não foi possível validar a imagem."
            );
        }

        if (ehJpeg(cabecalho, bytesLidos)) {
            return TipoImagem.JPEG;
        }

        if (ehPng(cabecalho, bytesLidos)) {
            return TipoImagem.PNG;
        }

        if (ehWebp(cabecalho, bytesLidos)) {
            return TipoImagem.WEBP;
        }

        return null;
    }

    private boolean ehJpeg(
            byte[] bytes,
            int tamanho
    ) {

        return tamanho >= 3
                && (bytes[0] & 0xFF) == 0xFF
                && (bytes[1] & 0xFF) == 0xD8
                && (bytes[2] & 0xFF) == 0xFF;
    }

    private boolean ehPng(
            byte[] bytes,
            int tamanho
    ) {

        return tamanho >= 8
                && (bytes[0] & 0xFF) == 0x89
                && bytes[1] == 0x50
                && bytes[2] == 0x4E
                && bytes[3] == 0x47
                && bytes[4] == 0x0D
                && bytes[5] == 0x0A
                && bytes[6] == 0x1A
                && bytes[7] == 0x0A;
    }

    private boolean ehWebp(
            byte[] bytes,
            int tamanho
    ) {

        return tamanho >= 12
                && bytes[0] == 'R'
                && bytes[1] == 'I'
                && bytes[2] == 'F'
                && bytes[3] == 'F'
                && bytes[8] == 'W'
                && bytes[9] == 'E'
                && bytes[10] == 'B'
                && bytes[11] == 'P';
    }

    private void validarCaminho(Path caminho) {

        if (!caminho.startsWith(storageDirectory)) {

            throw new BusinessException(
                    "Caminho de arquivo inválido."
            );
        }
    }

    private enum TipoImagem {

        JPEG(".jpg"),
        PNG(".png"),
        WEBP(".webp");

        private final String extensao;

        TipoImagem(String extensao) {
            this.extensao = extensao;
        }

        public String getExtensao() {
            return extensao;
        }
    }
}