package br.org.casadojulgamento.service;

import br.org.casadojulgamento.api.dto.user.CreateUserRequest;
import br.org.casadojulgamento.api.dto.user.UserResponse;
import br.org.casadojulgamento.domain.entity.User;
import br.org.casadojulgamento.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import br.org.casadojulgamento.exception.BusinessException;
import br.org.casadojulgamento.exception.ResourceNotFoundException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> listarTodos() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse buscarPorId(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                    new ResourceNotFoundException("Usuário não encontrado."));

        return toResponse(user);
    }

    public UserResponse criar(CreateUserRequest request) {
        String emailNormalizado = request.email()
                .trim()
                .toLowerCase();

        if (userRepository.existsByEmail(emailNormalizado)) {
            throw new BusinessException(
                    "Já existe um usuário com este e-mail."
            );
        }

        User user = User.builder()
                .nome(request.nome().trim())
                .email(emailNormalizado)
                .senha(passwordEncoder.encode(request.senha()))
                .telefone(request.telefone())
                .role(request.role())
                .ativo(true)
                .build();

        User usuarioSalvo = userRepository.save(user);

        return toResponse(usuarioSalvo);
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