package com.parkpulse.ticket.repository;

import com.parkpulse.ticket.model.Ticket;
import com.parkpulse.ticket.model.TicketStatus;
import com.parkpulse.ticket.model.VehicleType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.locks.ReentrantReadWriteLock;

@Repository
public class FileTicketRepository implements TicketRepository {

    private final String ticketsFile;
    private final String slotFile;
    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();

    public FileTicketRepository(@Value("${storage.path:data/}") String storagePath) {
        // Ensure directory exists
        File dir = new File(storagePath);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        this.ticketsFile = storagePath + "tickets.txt";
        this.slotFile = storagePath + "slot.txt";
    }

    @Override
    public List<Ticket> findAll() {
        lock.readLock().lock();
        try {
            List<Ticket> tickets = new ArrayList<>();
            tickets.addAll(readFromFile(ticketsFile));
            tickets.addAll(readFromFile(slotFile));
            return tickets;
        } finally {
            lock.readLock().unlock();
        }
    }

    private List<Ticket> readFromFile(String filePath) {
        List<Ticket> tickets = new ArrayList<>();
        File file = new File(filePath);
        if (!file.exists()) {
            return tickets;
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                Ticket ticket = fromCsv(line);
                if (ticket != null) {
                    tickets.add(ticket);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return tickets;
    }

    public void saveAll(List<Ticket> tickets) {
        lock.writeLock().lock();
        try {
            List<Ticket> finished = tickets.stream()
                    .filter(t -> t.getStatus() == TicketStatus.FINISHED)
                    .toList();
            List<Ticket> ongoing = tickets.stream()
                    .filter(t -> t.getStatus() != TicketStatus.FINISHED)
                    .toList();

            writeToFile(ticketsFile, finished);
            writeToFile(slotFile, ongoing);
        } finally {
            lock.writeLock().unlock();
        }
    }

    private void writeToFile(String filePath, List<Ticket> tickets) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filePath))) {
            for (Ticket ticket : tickets) {
                writer.write(toCsv(ticket));
                writer.newLine();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private String toCsv(Ticket t) {
        return String.format("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s",
                t.getId(),
                t.getVehiclePlate(),
                t.getOwnerName(),
                t.getSlot(),
                t.getEntryTime() != null ? t.getEntryTime().toString() : "",
                t.getExitTime() != null ? t.getExitTime().toString() : "",
                t.getAmount() != null ? t.getAmount() : 0.0,
                t.getStatus(),
                t.getVehicleType(),
                t.getPaymentMethod() != null ? t.getPaymentMethod() : "");
    }

    private Ticket fromCsv(String csv) {
        // Handle corrupted line or header safely
        if (csv.startsWith("c-") || csv.trim().length() < 10) return null;
        String[] parts = csv.split(",", -1);
        if (parts.length < 10) return null;
        try {
            Ticket ticket = new Ticket();
            ticket.setId(parts[0]);
            ticket.setVehiclePlate(parts[1]);
            ticket.setOwnerName(parts[2]);
            ticket.setSlot(parts[3]);
            ticket.setEntryTime(parts[4].isEmpty() ? null : LocalDateTime.parse(parts[4]));
            ticket.setExitTime(parts[5].isEmpty() ? null : LocalDateTime.parse(parts[5]));
            ticket.setAmount(parts[6].isEmpty() ? 0.0 : Double.parseDouble(parts[6]));
            ticket.setStatus(TicketStatus.fromString(parts[7]));
            ticket.setVehicleType(VehicleType.fromString(parts[8]));
            ticket.setPaymentMethod(parts[9].isEmpty() ? null : parts[9]);
            return ticket;
        } catch (Exception e) {
            System.err.println("Error parsing ticket CSV: " + csv + " - " + e.getMessage());
            return null;
        }
    }

    @Override
    public Ticket save(Ticket ticket) {
        lock.writeLock().lock();
        try {
            List<Ticket> tickets = findAll();
            Optional<Ticket> existing = tickets.stream()
                    .filter(t -> t.getId().equals(ticket.getId()))
                    .findFirst();

            if (existing.isPresent()) {
                int index = tickets.indexOf(existing.get());
                tickets.set(index, ticket);
            } else {
                tickets.add(ticket);
            }
            saveAll(tickets);
            return ticket;
        } finally {
            lock.writeLock().unlock();
        }
    }

    @Override
    public void deleteById(String id) {
        lock.writeLock().lock();
        try {
            List<Ticket> tickets = findAll();
            tickets.removeIf(t -> t.getId().equals(id));
            saveAll(tickets);
        } finally {
            lock.writeLock().unlock();
        }
    }

    @Override
    public Optional<Ticket> findById(String id) {
        lock.readLock().lock();
        try {
            return findAll().stream()
                    .filter(t -> t.getId().equals(id))
                    .findFirst();
        } finally {
            lock.readLock().unlock();
        }
    }

    @Override
    public Optional<Ticket> findBySlotAndStatus(String slot, TicketStatus status) {
        lock.readLock().lock();
        try {
            return findAll().stream()
                    .filter(t -> slot.equals(t.getSlot()) && t.getStatus() == status)
                    .findFirst();
        } finally {
            lock.readLock().unlock();
        }
    }

    @Override
    public void deleteAll() {
        lock.writeLock().lock();
        try {
            writeToFile(ticketsFile, new ArrayList<>());
            writeToFile(slotFile, new ArrayList<>());
        } finally {
            lock.writeLock().unlock();
        }
    }
}
