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
import br.org.casadojulgamento.api.dto.user.UpdateUserRequest;
import br.org.casadojulgamento.api.dto.user.ResetUserPasswordRequest;

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
                                "Usuário não encontrado."
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
                    "Já existe um usuário com este e-mail."
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
             * A verificação existsByEmail melhora a experiência,
             * mas a constraint UNIQUE do PostgreSQL é a proteção definitiva
             * contra requisições concorrentes.
             */
            throw new BusinessException(
                    "Já existe um usuário com este e-mail."
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
                                "Usuário não encontrado."
                        )
                );

        if (id.equals(usuarioLogadoId)
                && user.getRole() != request.role()) {
            throw new BusinessException(
                    "Você não pode alterar o próprio perfil de acesso."
            );
        }        

        String emailNormalizado = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (!user.getEmail().equals(emailNormalizado)
                && userRepository.existsByEmail(emailNormalizado)) {
            throw new BusinessException(
                    "Já existe um usuário com este e-mail."
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
                    "Já existe um usuário com este e-mail."
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
                                "Usuário não encontrado."
                        )
                );

        if (id.equals(usuarioLogadoId) && !ativo) {
            throw new BusinessException(
                    "Você não pode desativar a própria conta."
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
                                "Usuário não encontrado."
                        )
                );

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
                user.getRole(),
                user.getAtivo(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}