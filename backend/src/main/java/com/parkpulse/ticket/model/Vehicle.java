package com.parkpulse.ticket.model;

/**
 * Abstract base class for all vehicles.
 * Demonstrates the principle of Inheritance and Abstraction.
 */
public abstract class Vehicle {
    private String plate;
    private VehicleType type;

    public Vehicle(String plate, VehicleType type) {
        this.plate = plate;
        this.type = type;
    }

    public String getPlate() { return plate; }
    public VehicleType getType() { return type; }

    /**
     * Polymorphic method to get the hourly rate.
     */
    public abstract double getHourlyRate();

    /**
     * Factory method to create a Vehicle instance based on type.
     */
    public static Vehicle create(String plate, VehicleType type) {
        if (type == null) return new Car(plate);
        switch (type) {
            case SUV: return new SUV(plate);
            case MOTORCYCLE: return new Motorcycle(plate);
            case TRUCK: return new Truck(plate);
            case VAN: return new Van(plate);
            case CAR:
            default: return new Car(plate);
        }
    }
}

/**
 * Concrete Vehicle implementations.
 */
class Car extends Vehicle {
    public Car(String plate) { super(plate, VehicleType.CAR); }
    @Override public double getHourlyRate() { return 10.0; }
}

class SUV extends Vehicle {
    public SUV(String plate) { super(plate, VehicleType.SUV); }
    @Override public double getHourlyRate() { return 15.0; }
}

class Motorcycle extends Vehicle {
    public Motorcycle(String plate) { super(plate, VehicleType.MOTORCYCLE); }
    @Override public double getHourlyRate() { return 5.0; }
}

class Truck extends Vehicle {
    public Truck(String plate) { super(plate, VehicleType.TRUCK); }
    @Override public double getHourlyRate() { return 20.0; }
}

class Van extends Vehicle {
    public Van(String plate) { super(plate, VehicleType.VAN); }
    @Override public double getHourlyRate() { return 12.0; }
}
