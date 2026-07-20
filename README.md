# Casa do Julgamento — MVP

Fundação inicial da plataforma de gestão do evento.

## Requisitos

- Java 17+
- Maven 3.9+

## Executar em desenvolvimento

```bash
mvn spring-boot:run
```

A aplicação sobe em:

http://localhost:8080

Console H2:

http://localhost:8080/h2-console

JDBC URL:

jdbc:h2:mem:casadojulgamento

Usuário:

sa

Senha:

(vazia)

## Fluxo já implementado

- Evento e sessão seedados no perfil `dev`
- Formulário público de inscrição
- Participante ou Staff
- Validação básica
- Persistência em H2
- Geração automática de UUIDv4 para o ingresso
- Preparação para PostgreSQL via perfil `prod`

## Exemplo de chamada

```bash
curl -X POST http://localhost:8080/api/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "eventSessionId": 1,
    "fullName": "João Silva",
    "email": "joao@example.com",
    "cpf": "12345678901",
    "phone": "83999999999",
    "type": "ATTENDEE",
    "serviceArea": null
  }'
```

## Próxima etapa

- Validação real de CPF
- Geração visual do QR Code
- Ingresso PDF/imagem
- Endpoint transacional de check-in
- Busca manual
