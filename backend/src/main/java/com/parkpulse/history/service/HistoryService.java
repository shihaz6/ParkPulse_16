package com.parkpulse.history.service;

import com.parkpulse.history.dto.HistoryFiltersDTO;
import com.parkpulse.ticket.model.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface HistoryService {
    Page<Ticket> getHistory(HistoryFiltersDTO filters, Pageable pageable);
    long getTotalCount(HistoryFiltersDTO filters);
    Ticket getById(String id);
}