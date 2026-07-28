package br.org.casadojulgamento.config;

import br.org.casadojulgamento.domain.entity.Event;
import br.org.casadojulgamento.domain.entity.EventSession;
import br.org.casadojulgamento.domain.enums.EventSessionStatus;
import br.org.casadojulgamento.domain.enums.EventStatus;
import br.org.casadojulgamento.repository.EventRepository;
import br.org.casadojulgamento.repository.EventSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.time.LocalDate;
import java.time.LocalTime;

@Configuration
@RequiredArgsConstructor
public class SeedDataConfig {

    @Bean
    @Profile("dev")
    CommandLineRunner seed(
            EventRepository eventRepository,
            EventSessionRepository sessionRepository
    ) {
        return args -> {
            if (eventRepository.count() > 0) {
                return;
            }

            Event event = Event.builder()
                    .name("Casa do Julgamento 2026")
                    .description("Evento imersivo e interativo.")
                    .startDate(LocalDate.of(2026, 10, 29))
                    .endDate(LocalDate.of(2026, 11, 14))
                    .status(EventStatus.PLANNING)
                    .active(true)
                    .build();

            Event eventSalvo = eventRepository.save(event);

            EventSession session = EventSession.builder()
                    .event(eventSalvo)
                    .date(LocalDate.of(2026, 10, 29))
                    .startTime(LocalTime.of(18, 0))
                    .capacity(25)
                    .status(EventSessionStatus.OPEN)
                    .active(true)
                    .build();

            sessionRepository.save(session);
        };
    }
}