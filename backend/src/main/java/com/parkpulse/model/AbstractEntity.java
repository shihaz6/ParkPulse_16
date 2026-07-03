package com.parkpulse.model;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import org.hibernate.annotations.GenericGenerator;

/**
 * Base class for all domain models.
 * Demonstrates Abstraction and Inheritance.
 */
@MappedSuperclass
public abstract class AbstractEntity {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    protected String id;

    public AbstractEntity() {}

    public AbstractEntity(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    /**
     * Abstract method to be implemented by subclasses for serialization.
     */
    public abstract String toDataString();
}
