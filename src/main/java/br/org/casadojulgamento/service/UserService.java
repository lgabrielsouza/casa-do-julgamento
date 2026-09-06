package br.org.casadojulgamento.service;

import br.org.casadojulgamento.api.dto.user.CreateUserRequest;
import br.org.casadojulgamento.api.dto.user.UserResponse;
import br.org.casadojulgamento.domain.entity.User;
import br.org.casadojulgamento.exception.BusinessException;
import br.org.casadojulgamento.exception.ResourceNotFoundException;
import br.org.casadojulgamento.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartFile;
import br.org.casadojulgamento.api.dto.user.UpdateUserRequest;
import br.org.casadojulgamento.api.dto.user.ResetUserPasswordRequest;
import br.org.casadojulgamento.api.dto.user.UpdateMyProfileRequest;
import br.org.casadojulgamento.api.dto.user.ChangeMyPasswordRequest;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserResponse> listarTodos() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse buscarPorId(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "UsuÃ¡rio nÃ£o encontrado."
                        )
                );

        return toResponse(user);
    }

    @Transactional
    public UserResponse criar(CreateUserRequest request) {
        String emailNormalizado = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(emailNormalizado)) {
            throw new BusinessException(
                    "JÃ¡ existe um usuÃ¡rio com este e-mail."
            );
        }

        User user = User.builder()
                .nome(request.nome().trim())
                .email(emailNormalizado)
                .senha(passwordEncoder.encode(request.senha()))
                .telefone(normalizarTelefone(request.telefone()))
                .role(request.role())
                .ativo(true)
                .build();

        try {
            User usuarioSalvo = userRepository.saveAndFlush(user);
            return toResponse(usuarioSalvo);

        } catch (DataIntegrityViolationException exception) {
            /*
             * A verificaÃ§Ã£o existsByEmail melhora a experiÃªncia,
             * mas a constraint UNIQUE do PostgreSQL Ã© a proteÃ§Ã£o definitiva
             * contra requisiÃ§Ãµes concorrentes.
             */
            throw new BusinessException(
                    "JÃ¡ existe um usuÃ¡rio com este e-mail."
            );
        }
    }

        @Transactional
        public UserResponse atualizar(
                Long id,
                UpdateUserRequest request,
                Long usuarioLogadoId
        ) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "UsuÃ¡rio nÃ£o encontrado."
                        )
                );

        if (id.equals(usuarioLogadoId)
                && user.getRole() != request.role()) {
            throw new BusinessException(
                    "VocÃª nÃ£o pode alterar o prÃ³prio perfil de acesso."
            );
        }

        String emailNormalizado = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (!user.getEmail().equals(emailNormalizado)
                && userRepository.existsByEmail(emailNormalizado)) {
            throw new BusinessException(
                    "JÃ¡ existe um usuÃ¡rio com este e-mail."
            );
        }

        user.setNome(request.nome().trim());
        user.setEmail(emailNormalizado);
        user.setTelefone(normalizarTelefone(request.telefone()));
        user.setRole(request.role());

        try {
            User usuarioAtualizado =
                    userRepository.saveAndFlush(user);

            return toResponse(usuarioAtualizado);

        } catch (DataIntegrityViolationException exception) {
            throw new BusinessException(
                    "JÃ¡ existe um usuÃ¡rio com este e-mail."
            );
        }
    }

    @Transactional
    public UserResponse alterarStatus(
            Long id,
            boolean ativo,
            Long usuarioLogadoId
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "UsuÃ¡rio nÃ£o encontrado."
                        )
                );

        if (id.equals(usuarioLogadoId) && !ativo) {
            throw new BusinessException(
                    "VocÃª nÃ£o pode desativar a prÃ³pria conta."
            );
        }

        user.setAtivo(ativo);

        User usuarioAtualizado =
                userRepository.saveAndFlush(user);

        return toResponse(usuarioAtualizado);
    }

    @Transactional
    public void redefinirSenha(
            Long id,
            ResetUserPasswordRequest request
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "UsuÃ¡rio nÃ£o encontrado."
                        )
                );

        user.setSenha(
                passwordEncoder.encode(request.novaSenha())
        );

        userRepository.saveAndFlush(user);
        }

        @Transactional
        public UserResponse atualizarMeuPerfil(
                Long usuarioLogadoId,
                UpdateMyProfileRequest request
        ) {
        User user = userRepository.findById(usuarioLogadoId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "UsuÃ¡rio nÃ£o encontrado."
                        )
                );

        user.setNome(request.nome().trim());
        user.setTelefone(normalizarTelefone(request.telefone()));

        User usuarioAtualizado =
                userRepository.saveAndFlush(user);

        return toResponse(usuarioAtualizado);
        }

        @Transactional
        public void alterarMinhaSenha(
                Long usuarioLogadoId,
                ChangeMyPasswordRequest request
        ) {
        User user = userRepository.findById(usuarioLogadoId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "UsuÃ¡rio nÃ£o encontrado."
                        )
                );

        if (!passwordEncoder.matches(
                request.senhaAtual(),
                user.getSenha()
        )) {
                throw new BusinessException(
                        "A senha atual estÃ¡ incorreta."
                );
        }

        if (passwordEncoder.matches(
                request.novaSenha(),
                user.getSenha()
        )) {
                throw new BusinessException(
                        "A nova senha deve ser diferente da senha atual."
                );
        }

        user.setSenha(
                passwordEncoder.encode(request.novaSenha())
        );

        userRepository.saveAndFlush(user);
        }

    private String normalizarTelefone(String telefone) {
        if (telefone == null || telefone.isBlank()) {
            return null;
        }

        return telefone.trim();
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getNome(),
                user.getEmail(),
                user.getTelefone(),
                user.getFotoPerfil(),
                user.getRole(),
                user.getAtivo(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
    private final ProfileImageStorageService profileImageStorageService;

    @Transactional
        public UserResponse atualizarFotoPerfil(
                Long usuarioLogadoId,
                MultipartFile arquivo
        ) {
        User user = userRepository.findById(usuarioLogadoId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "UsuÃ¡rio nÃ£o encontrado."
                        )
                );

        String fotoAnterior = user.getFotoPerfil();

        String novaFoto =
                profileImageStorageService.salvar(arquivo);

        user.setFotoPerfil(novaFoto);

        User usuarioAtualizado =
                userRepository.saveAndFlush(user);

        if (fotoAnterior != null &&
                !fotoAnterior.isBlank()) {
                profileImageStorageService.excluir(fotoAnterior);
        }

        return toResponse(usuarioAtualizado);
        }

     @Transactional
        public UserResponse removerFotoPerfil(
                Long usuarioLogadoId
        ) {
        User user = userRepository.findById(usuarioLogadoId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "UsuÃ¡rio nÃ£o encontrado."
                        )
                );

        String fotoAnterior = user.getFotoPerfil();

        user.setFotoPerfil(null);

        User usuarioAtualizado =
                userRepository.saveAndFlush(user);

        if (fotoAnterior != null &&
                !fotoAnterior.isBlank()) {
                profileImageStorageService.excluir(fotoAnterior);
        }

        return toResponse(usuarioAtualizado);
        }
}
