package br.org.casadojulgamento.repository;

import br.org.casadojulgamento.domain.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    boolean existsByEventIdAndCpf(Long eventId, String cpf);
}
