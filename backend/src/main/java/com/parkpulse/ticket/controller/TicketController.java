package com.parkpulse.ticket.controller;

import com.parkpulse.ticket.dto.TicketDTO;
import com.parkpulse.ticket.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('tickets', 'parking-slots', '*')")
    public List<TicketDTO> getAllTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String vehicleType,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) String slot,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(required = false) Double amountMin,
            @RequestParam(required = false) Double amountMax) {
        
        return ticketService.getAllTickets(status, vehicleType, paymentMethod, slot, dateFrom, dateTo, amountMin, amountMax);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('tickets', 'parking-slots', '*')")
    public ResponseEntity<TicketDTO> getTicketById(@PathVariable String id) {
        return ticketService.getTicketById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('tickets', '*')")
    public TicketDTO createTicket(@Valid @RequestBody TicketDTO ticketDTO) {
        return ticketService.createTicket(ticketDTO);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('tickets', '*')")
    public ResponseEntity<TicketDTO> updateTicket(@PathVariable String id, @Valid @RequestBody TicketDTO ticketDTO) {
        TicketDTO updated = ticketService.updateTicket(id, ticketDTO);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('tickets', '*')")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id) {
        if (!ticketService.getTicketById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        ticketService.deleteTicket(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/checkout")
    @PreAuthorize("hasAnyAuthority('tickets', 'parking-slots', '*')")
    public ResponseEntity<TicketDTO> checkout(@PathVariable String id, @RequestParam String paymentMethod) {
        TicketDTO ticketDTO = ticketService.checkout(id, paymentMethod);
        if (ticketDTO == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ticketDTO);
    }
}
