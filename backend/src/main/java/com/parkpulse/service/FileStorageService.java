package com.parkpulse.service;

import com.parkpulse.exception.DataStorageException;
import com.parkpulse.model.AbstractEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class FileStorageService {

    @Value("${storage.path:data}")
    private String storagePath;

    // Concurrency registry: one ReentrantReadWriteLock per filename
    private final ConcurrentHashMap<String, ReentrantReadWriteLock> locks = new ConcurrentHashMap<>();

    private ReentrantReadWriteLock getLock(String fileName) {
        return locks.computeIfAbsent(fileName, k -> new ReentrantReadWriteLock());
    }

    /**
     * Loads all items from a file.
     * Demonstrates Exception Handling by catching IOException and throwing custom DataStorageException.
     */
    public <T> List<T> loadAll(String fileName, Function<String, T> mapper) {
        ReentrantReadWriteLock lock = getLock(fileName);
        lock.readLock().lock();
        try {
            Path path = Paths.get(storagePath, fileName);
            if (!Files.exists(path)) {
                return new ArrayList<>();
            }
            try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
                return reader.lines()
                        .map(mapper)
                        .filter(item -> item != null)
                        .collect(Collectors.toList());
            } catch (IOException e) {
                throw new DataStorageException("Critical error: Unable to load data from " + fileName, e);
            }
        } finally {
            lock.readLock().unlock();
        }
    }

    /**
     * Saves a list of entities to a file.
     * Demonstrates Polymorphism and Abstraction by using AbstractEntity.
     */
    public <T extends AbstractEntity> void saveAll(String fileName, List<T> data) {
        ReentrantReadWriteLock lock = getLock(fileName);
        lock.writeLock().lock();
        try {
            Path path = Paths.get(storagePath, fileName);
            try {
                Files.createDirectories(path.getParent());
                try (BufferedWriter writer = Files.newBufferedWriter(path, StandardCharsets.UTF_8)) {
                    for (T item : data) {
                        if (item != null) {
                            writer.write(item.toDataString());
                            writer.newLine();
                        }
                    }
                }
            } catch (IOException e) {
                throw new DataStorageException("Critical error: Unable to save data to " + fileName, e);
            }
        } finally {
            lock.writeLock().unlock();
        }
    }

    /**
     * Appends a single entity to a file.
     */
    public <T extends AbstractEntity> void append(String fileName, T item) {
        ReentrantReadWriteLock lock = getLock(fileName);
        lock.writeLock().lock();
        try {
            Path path = Paths.get(storagePath, fileName);
            try {
                Files.createDirectories(path.getParent());
                try (BufferedWriter writer = new BufferedWriter(new FileWriter(path.toFile(), true))) {
                    if (item != null) {
                        writer.write(item.toDataString());
                        writer.newLine();
                    }
                }
            } catch (IOException e) {
                throw new DataStorageException("Critical error: Unable to append data to " + fileName, e);
            }
        } finally {
            lock.writeLock().unlock();
        }
    }
}
