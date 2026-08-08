package com.parkpulse.history.controller;

import com.parkpulse.history.dto.HistoryFiltersDTO;
import com.parkpulse.history.service.HistoryService;
import com.parkpulse.ticket.model.Ticket;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings/history")
public class HistoryController {

    @Autowired
    private HistoryService historyService;

    @GetMapping
    public ResponseEntity<Page<Ticket>> getHistory(
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(required = false) String zoneId,
            @RequestParam(required = false) String vehiclePlate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String memberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        HistoryFiltersDTO filters = new HistoryFiltersDTO();
        
        if (dateFrom != null && !dateFrom.isEmpty()) {
            filters.setDateFrom(java.time.LocalDateTime.parse(dateFrom));
        }
        if (dateTo != null && !dateTo.isEmpty()) {
            filters.setDateTo(java.time.LocalDateTime.parse(dateTo));
        }
        filters.setZoneId(zoneId);
        filters.setVehiclePlate(vehiclePlate);
        filters.setStatus(status);
        filters.setMemberId(memberId);
        filters.setPage(page);
        filters.setSize(size);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "entryTime"));
        Page<Ticket> result = historyService.getHistory(filters, pageable);
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getById(@PathVariable String id) {
        Ticket ticket = historyService.getById(id);
        if (ticket == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ticket);
    }
}