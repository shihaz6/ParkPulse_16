package com.parkpulse.ticket.repository;

import com.parkpulse.ticket.model.Ticket;
import com.parkpulse.ticket.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpringDataTicketRepository extends JpaRepository<Ticket, String> {
    Optional<Ticket> findBySlotAndStatus(String slot, TicketStatus status);
}
