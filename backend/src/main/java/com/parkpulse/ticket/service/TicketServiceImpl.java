package com.parkpulse.ticket.service;

import com.parkpulse.ticket.dto.TicketDTO;
import com.parkpulse.ticket.model.Ticket;
import com.parkpulse.ticket.model.TicketStatus;
import com.parkpulse.ticket.model.VehicleType;
import com.parkpulse.ticket.repository.TicketRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.parkpulse.ticket.model.VehicleType;

/**
 * Concrete implementation of TicketService.
 * Handles business logic and filtering.
 */
@Service
public class TicketServiceImpl implements TicketService {

    @Autowired
    private TicketRepository repository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public List<TicketDTO> getAllTickets(
            String status,
            String vehicleType,
            String paymentMethod,
            String slot,
            String dateFrom,
            String dateTo,
            Double amountMin,
            Double amountMax) {

        List<Ticket> tickets = repository.findAll();

        return tickets.stream().filter(t -> {
            if (status != null && !status.equalsIgnoreCase(t.getStatus().name())) return false;
            if (vehicleType != null && !vehicleType.equalsIgnoreCase(t.getVehicleType().name())) return false;
            if (paymentMethod != null && !paymentMethod.equalsIgnoreCase(t.getPaymentMethod())) return false;
            if (slot != null && !t.getSlot().toLowerCase().contains(slot.toLowerCase())) return false;

            // Robust date-based comparison using LocalDateTime objects
            if (t.getEntryTime() != null) {
                if (dateFrom != null) {
                    try {
                        LocalDateTime from = LocalDateTime.parse(dateFrom);
                        if (t.getEntryTime().isBefore(from)) return false;
                    } catch (Exception e) {
                        // Skip filter on parse failure
                    }
                }
                if (dateTo != null) {
                    try {
                        LocalDateTime to = LocalDateTime.parse(dateTo);
                        if (t.getEntryTime().isAfter(to)) return false;
                    } catch (Exception e) {
                        // Skip filter on parse failure
                    }
                }
            }

            if (amountMin != null && (t.getAmount() == null || t.getAmount() < amountMin)) return false;
            if (amountMax != null && (t.getAmount() == null || t.getAmount() > amountMax)) return false;

            return true;
        }).map(this::mapToDTO).toList();
    }

    @Override
    public Optional<TicketDTO> getTicketById(String id) {
        return repository.findById(id).map(this::mapToDTO);
    }

    @Override
    public TicketDTO createTicket(TicketDTO dto) {
        Ticket ticket = mapToEntity(dto);
        if (ticket.getId() == null) {
            ticket.setId(UUID.randomUUID().toString());
        }
        if (ticket.getStatus() == null) {
            ticket.setStatus(TicketStatus.ONGOING);
        }
        return mapToDTO(repository.save(ticket));
    }

    @Override
    public TicketDTO updateTicket(String id, TicketDTO dto) {
        if (!repository.findById(id).isPresent()) {
            return null;
        }
        Ticket ticket = mapToEntity(dto);
        ticket.setId(id);
        return mapToDTO(repository.save(ticket));
    }

    @Override
    public void deleteTicket(String id) {
        repository.deleteById(id);
    }

    @Override
    public TicketDTO checkout(String id, String paymentMethod) {
        return checkout(id, paymentMethod, null);
    }

    @Override
    public TicketDTO checkout(String id, String paymentMethod, Double ratePerHour) {
        Optional<Ticket> ticketOpt = repository.findById(id);
        if (ticketOpt.isPresent()) {
            Ticket ticket = ticketOpt.get();
            if (ratePerHour != null && ratePerHour > 0) {
                ticket.setRatePerHour(ratePerHour);
            }
            ticket.completePayment(null, paymentMethod);
            return mapToDTO(repository.save(ticket));
        }
        return null;
    }

    @Override
    public TicketDTO createOngoingFromParking(String vehiclePlate, String ownerName, String slot, String vehicleType,
                                              LocalDateTime entryTime, double ratePerHour) {
        Ticket ticket = new Ticket();
        ticket.setId(UUID.randomUUID().toString());
        ticket.setVehiclePlate(vehiclePlate);
        ticket.setOwnerName(ownerName);
        ticket.setSlot(slot);
        ticket.setEntryTime(entryTime);
        ticket.setRatePerHour(ratePerHour > 0 ? ratePerHour : null);
        ticket.setVehicleType(mapVehicleType(vehicleType));
        ticket.setStatus(TicketStatus.ONGOING);
        return mapToDTO(repository.save(ticket));
    }

    @Override
    public Optional<TicketDTO> findOngoingTicketBySlot(String slotId) {
        return repository.findBySlotAndStatus(slotId, TicketStatus.ONGOING)
                .map(this::mapToDTO);
    }

    @Override
    public TicketDTO createFromParkingSlot(String vehiclePlate, String ownerName, String slot, String vehicleType,
                                           LocalDateTime entryTime, String paymentMethod, double ratePerHour) {
        Ticket ticket = new Ticket();
        ticket.setId(UUID.randomUUID().toString());
        ticket.setVehiclePlate(vehiclePlate);
        ticket.setOwnerName(ownerName);
        ticket.setSlot(slot);
        ticket.setEntryTime(entryTime);
        ticket.setExitTime(LocalDateTime.now());
        ticket.setRatePerHour(ratePerHour);
        ticket.setVehicleType(mapVehicleType(vehicleType));
        ticket.setPaymentMethod(paymentMethod);
        ticket.setStatus(TicketStatus.FINISHED);

        // Calculate amount
        if (entryTime != null) {
            long minutes = Duration.between(entryTime, ticket.getExitTime()).toMinutes();
            double hours = Math.ceil(minutes / 60.0);
            if (hours < 1) hours = 1;
            ticket.setAmount(hours * ratePerHour);
        } else {
            ticket.setAmount(ratePerHour);
        }

        return mapToDTO(repository.save(ticket));
    }

    private VehicleType mapVehicleType(String type) {
        if (type == null) return VehicleType.CAR;
        String upper = type.toUpperCase();
        // Map common parking vehicle type strings to ticket VehicleType enum
        if (upper.contains("SUV")) return VehicleType.SUV;
        if (upper.contains("MOTORCYCLE") || upper.contains("BIKE")) return VehicleType.MOTORCYCLE;
        if (upper.contains("TRUCK")) return VehicleType.TRUCK;
        if (upper.contains("VAN") || upper.contains("MINIVAN")) return VehicleType.VAN;
        return VehicleType.CAR;
    }

    private TicketDTO mapToDTO(Ticket t) {
        TicketDTO dto = modelMapper.map(t, TicketDTO.class);

        // Compute durationMins from entryTime / exitTime
        if (t.getEntryTime() != null) {
            LocalDateTime end = t.getExitTime() != null ? t.getExitTime() : LocalDateTime.now();
            dto.setDurationMins(Duration.between(t.getEntryTime(), end).toMinutes());
        }

        // Derive zone from slot prefix (e.g. "A3" → "Zone A")
        if (t.getSlot() != null) {
            Matcher m = Pattern.compile("^([A-Za-z]+)").matcher(t.getSlot());
            if (m.find()) {
                dto.setZone("Zone " + m.group(1).toUpperCase());
            }
        }

        return dto;
    }

    private Ticket mapToEntity(TicketDTO dto) {
        return modelMapper.map(dto, Ticket.class);
    }
}
