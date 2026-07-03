package com.parkpulse.ticket.repository;

import com.parkpulse.ticket.model.Ticket;
import com.parkpulse.ticket.model.TicketStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Primary
public class SqlTicketRepository implements TicketRepository {

    @Autowired
    private SpringDataTicketRepository springDataTicketRepository;

    @Override
    public List<Ticket> findAll() {
        return springDataTicketRepository.findAll();
    }

    @Override
    public Ticket save(Ticket ticket) {
        return springDataTicketRepository.save(ticket);
    }

    @Override
    public void deleteById(String id) {
        springDataTicketRepository.deleteById(id);
    }

    @Override
    public Optional<Ticket> findById(String id) {
        return springDataTicketRepository.findById(id);
    }

    @Override
    public Optional<Ticket> findBySlotAndStatus(String slot, TicketStatus status) {
        return springDataTicketRepository.findBySlotAndStatus(slot, status);
    }

    @Override
    public void deleteAll() {
        springDataTicketRepository.deleteAll();
    }
}
