package com.parkpulse.ticket.service;

import com.parkpulse.ticket.dto.TicketDTO;
import java.util.List;
import java.util.Optional;

/**
 * Abstraction for Ticket business logic.
 */
public interface TicketService {
    List<TicketDTO> getAllTickets(
            String status,
            String vehicleType,
            String paymentMethod,
            String slot,
            String dateFrom,
            String dateTo,
            Double amountMin,
            Double amountMax);

    Optional<TicketDTO> getTicketById(String id);
    TicketDTO createTicket(TicketDTO ticketDTO);
    TicketDTO updateTicket(String id, TicketDTO ticketDTO);
    void deleteTicket(String id);
    TicketDTO checkout(String id, String paymentMethod);
    TicketDTO checkout(String id, String paymentMethod, Double ratePerHour);
    TicketDTO createFromParkingSlot(String vehiclePlate, String ownerName, String slot, String vehicleType,
                                    java.time.LocalDateTime entryTime, String paymentMethod, double ratePerHour);
    TicketDTO createOngoingFromParking(String vehiclePlate, String ownerName, String slot, String vehicleType,
                                       java.time.LocalDateTime entryTime, double ratePerHour);
    java.util.Optional<TicketDTO> findOngoingTicketBySlot(String slotId);
}
