package com.parkpulse.history.service;

import com.parkpulse.history.dto.HistoryFiltersDTO;
import com.parkpulse.ticket.model.Ticket;
import com.parkpulse.ticket.repository.SpringDataTicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HistoryServiceImpl implements HistoryService {

    @Autowired
    private SpringDataTicketRepository ticketRepository;

    @Override
    public Page<Ticket> getHistory(HistoryFiltersDTO filters, Pageable pageable) {
        List<Ticket> allTickets = ticketRepository.findAll();
        
        List<Ticket> filtered = allTickets.stream()
            .filter(t -> filters.getDateFrom() == null || t.getEntryTime() == null || !t.getEntryTime().isBefore(filters.getDateFrom()))
            .filter(t -> filters.getDateTo() == null || t.getEntryTime() == null || !t.getEntryTime().isAfter(filters.getDateTo()))
            .filter(t -> filters.getVehiclePlate() == null || filters.getVehiclePlate().isEmpty() 
                || (t.getVehiclePlate() != null && t.getVehiclePlate().toLowerCase().contains(filters.getVehiclePlate().toLowerCase())))
            .filter(t -> filters.getStatus() == null || filters.getStatus().isEmpty() 
                || (t.getStatus() != null && t.getStatus().name().equalsIgnoreCase(filters.getStatus())))
            .filter(t -> filters.getZoneId() == null || filters.getZoneId().isEmpty()
                || (t.getSlot() != null && t.getSlot().toLowerCase().contains(filters.getZoneId().toLowerCase())))
            .filter(t -> filters.getMemberId() == null || filters.getMemberId().isEmpty()
                || (t.getOwnerName() != null && t.getOwnerName().toLowerCase().contains(filters.getMemberId().toLowerCase())))
            .sorted((a, b) -> {
                // Sort by entry time descending (newest first)
                if (a.getEntryTime() == null && b.getEntryTime() == null) return 0;
                if (a.getEntryTime() == null) return 1;
                if (b.getEntryTime() == null) return -1;
                return b.getEntryTime().compareTo(a.getEntryTime());
            })
            .collect(Collectors.toList());

        long total = filtered.size();
        
        // Apply pagination
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        
        if (start >= filtered.size()) {
            return new PageImpl<>(new ArrayList<>(), pageable, total);
        }
        
        List<Ticket> paged = filtered.subList(start, end);
        return new PageImpl<>(paged, pageable, total);
    }

    @Override
    public long getTotalCount(HistoryFiltersDTO filters) {
        List<Ticket> allTickets = ticketRepository.findAll();
        
        return allTickets.stream()
            .filter(t -> filters.getDateFrom() == null || t.getEntryTime() == null || !t.getEntryTime().isBefore(filters.getDateFrom()))
            .filter(t -> filters.getDateTo() == null || t.getEntryTime() == null || !t.getEntryTime().isAfter(filters.getDateTo()))
            .filter(t -> filters.getVehiclePlate() == null || filters.getVehiclePlate().isEmpty() 
                || (t.getVehiclePlate() != null && t.getVehiclePlate().toLowerCase().contains(filters.getVehiclePlate().toLowerCase())))
            .filter(t -> filters.getStatus() == null || filters.getStatus().isEmpty() 
                || (t.getStatus() != null && t.getStatus().name().equalsIgnoreCase(filters.getStatus())))
            .filter(t -> filters.getZoneId() == null || filters.getZoneId().isEmpty()
                || (t.getSlot() != null && t.getSlot().toLowerCase().contains(filters.getZoneId().toLowerCase())))
            .filter(t -> filters.getMemberId() == null || filters.getMemberId().isEmpty()
                || (t.getOwnerName() != null && t.getOwnerName().toLowerCase().contains(filters.getMemberId().toLowerCase())))
            .count();
    }

    @Override
    public Ticket getById(String id) {
        return ticketRepository.findById(id).orElse(null);
    }
}