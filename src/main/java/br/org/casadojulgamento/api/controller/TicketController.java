package br.org.casadojulgamento.api.controller;

import br.org.casadojulgamento.repository.TicketRepository;
import br.org.casadojulgamento.service.QrCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketRepository ticketRepository;
    private final QrCodeService qrCodeService;

    @GetMapping(
        value = "/qr/{qrToken}",
        produces = MediaType.IMAGE_PNG_VALUE
    )
    public ResponseEntity<byte[]> generateQrCode(
        @PathVariable String qrToken
    ) {

        ticketRepository.findByQrToken(qrToken)
            .orElseThrow(
                () -> new RuntimeException("Ingresso não encontrado.")
            );

        byte[] qrCode = qrCodeService.generateQrCode(
            qrToken,
            300,
            300
        );

        return ResponseEntity.ok(qrCode);
    }
}