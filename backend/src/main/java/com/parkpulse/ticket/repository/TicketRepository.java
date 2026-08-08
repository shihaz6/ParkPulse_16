package com.parkpulse.ticket.repository;

import com.parkpulse.ticket.model.Ticket;
import com.parkpulse.ticket.model.TicketStatus;
import java.util.List;
import java.util.Optional;

/**
 * Abstraction for Ticket data access.
 * Demonstrates the principle of Abstraction in OOP.
 */
public interface TicketRepository {
    List<Ticket> findAll();
    Ticket save(Ticket ticket);
    void deleteById(String id);
    Optional<Ticket> findById(String id);
    Optional<Ticket> findBySlotAndStatus(String slot, TicketStatus status);
    void deleteAll();
}
