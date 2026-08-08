# Implementation Plan — SQL Database Integration (JPA & H2/MySQL/PostgreSQL)

This plan details the transition of the Park Pulse application from flat-file storage to an SQL-compliant relational database. We will use **Spring Data JPA** (Java Persistence API) for Object-Relational Mapping (ORM) and **H2 Database** for local zero-installation setup (which can be switched to MySQL or PostgreSQL instantly via configuration).

---

## 🏗️ Relational DB Refactoring Objectives

1. **Keep SOLID Principles Intact**:
   * **Dependency Inversion**: Service and Controller classes will continue to depend only on repository interfaces. No service or controller code changes are required.
   * **Interface implementations**: We will create SQL-specific implementations of our repository interfaces (e.g. `SqlMemberRepository` implementing `MemberRepository`) and annotate them as `@Primary`.
2. **Flexible SQL Dialect**:
   * Out-of-the-box support for a persistent file-based SQL database (H2) for development/testing.
   * Simple property changes in `application.properties` to switch to MySQL or PostgreSQL for production.
3. **Database Pre-population**:
   * Retain database initialization logics to pre-populate tables with default users, members, zones, plans, and staff on first boot if they are empty.

---

## 📁 Proposed Architecture & New Classes

For each subsystem, we will introduce:
1. **Spring Data JPA Interfaces** (under `repository` subpackages) extending `JpaRepository`.
2. **JPA SQL Implementations** (implementing our SOLID repository interfaces) annotated with `@Repository` and `@Primary` to intercept calls and delegate to JPA.
3. **Model Entities**: Annotating existing models with JPA annotations (`@Entity`, `@Table`, `@Id`, `@GeneratedValue(strategy = GenerationType.IDENTITY)`, `@Column`, `@ElementCollection`, `@Enumerated`).

---

## 🛠️ Proposed Changes

### 1. Build & Config

#### [MODIFY] [pom.xml](file:///C:/Users/shihaz%20shaheem/Desktop/complete%20Project/System%20settings%20and%20admin%20dashboard/pom.xml)
Add the following dependencies:
* `spring-boot-starter-data-jpa`
* `com.h2database:h2` (runtime scope)
* `com.mysql:mysql-connector-j` (optional/runtime scope)

#### [MODIFY] [application.properties](file:///C:/Users/shihaz%20shaheem/Desktop/complete%20Project/System%20settings%20and%20admin%20dashboard/src/main/resources/application.properties)
Configure the database source (H2 file-based SQL, enabling the web H2 console at `/h2-console`):
```properties
spring.datasource.url=jdbc:h2:file:./data/db/parkpulsedb;DB_CLOSE_DELAY=-1
spring.datasource.username=sa
spring.datasource.password=
spring.datasource.driver-class-name=org.h2.Driver

spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
spring.h2.console.settings.web-allow-others=true

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect
```

---

### 2. Entity Annotations (Models)

* **[AbstractEntity](file:///C:/Users/shihaz%20shaheem/Desktop/complete%20Project/System%20settings%20and%20admin%20dashboard/src/main/java/com/parkpulse/model/AbstractEntity.java)**:
  Annotate as `@MappedSuperclass` so subclasses inherit `id` as a primary key.
  
* **[User](file:///C:/Users/shihaz%20shaheem/Desktop/complete%20Project/System%20settings%20and%20admin%20dashboard/src/main/java/com/parkpulse/model/User.java)**, **[GeneralSettings](file:///C:/Users/shihaz%20shaheem/Desktop/complete%20Project/System%20settings%20and%20admin%20dashboard/src/main/java/com/parkpulse/model/GeneralSettings.java)**, **[SecuritySettings](file:///C:/Users/shihaz%20shaheem/Desktop/complete%20Project/System%20settings%20and%20admin%20dashboard/src/main/java/com/parkpulse/model/SecuritySettings.java)**:
  Annotate with `@Entity` and `@Table`.
  
* **[Member](file:///C:/Users/shihaz%20shaheem/Desktop/complete%20Project/System%20settings%20and%20admin%20dashboard/src/main/java/com/parkpulse/member/model/Member.java)**, **[Plan](file:///C:/Users/shihaz%20shaheem/Desktop/complete%20Project/System%20settings%20and%20admin%20dashboard/src/main/java/com/parkpulse/member/model/Plan.java)**:
  Annotate with `@Entity` and `@Table`. Map the list of features (`List<String>`) in `Plan` as an `@ElementCollection`.
  
* **[ParkingSlot](file:///C:/Users/shihaz%20shaheem/Desktop/complete%20Project/System%20settings%20and%20admin%20dashboard/src/main/java/com/parkpulse/parking/model/ParkingSlot.java)**, **[ParkingSession](file:///C:/Users/shihaz%20shaheem/Desktop/complete%20Project/System%20settings%20and%20admin%20dashboard/src/main/java/com/parkpulse/parking/model/ParkingSession.java)**, **[Zone](file:///C:/Users/shihaz%20shaheem/Desktop/complete%20Project/System%20settings%20and%20admin%20dashboard/src/main/java/com/parkpulse/parking/model/Zone.java)**:
  Annotate with `@Entity` and `@Table`. Map `vehicleTypes` in `Zone` as an `@ElementCollection`.
  
* **[Staff](file:///C:/Users/shihaz%20shaheem/Desktop/complete%20Project/System%20settings%20and%20admin%20dashboard/src/main/java/com/parkpulse/staff/model/Staff.java)**:
  Annotate with `@Entity`. Map `customPermissions` as an `@ElementCollection`.
  
* **[Ticket](file:///C:/Users/shihaz%20shaheem/Desktop/complete%20Project/System%20settings%20and%20admin%20dashboard/src/main/java/com/parkpulse/ticket/model/Ticket.java)**:
  Annotate with `@Entity` and `@Table`. Map Enum fields (`TicketStatus`, `VehicleType`) as `@Enumerated(EnumType.STRING)`.
  
* **[ProblemReport](file:///C:/Users/shihaz%20shaheem/Desktop/complete%20Project/System%20settings%20and%20admin%20dashboard/src/main/java/com/parkpulse/report/model/ProblemReport.java)**:
  Annotate with `@Entity`. Set `id` to `@GeneratedValue(strategy = GenerationType.IDENTITY)`. Map Enums.

---

### 3. JPA Repository Implementations

We will create JPA interfaces and concrete SQL repositories:

* **User Subsystem**:
  * `SpringDataUserRepository` extends `JpaRepository<User, String>`
  * `SqlUserRepository` implements `UserRepository` (Annotated `@Primary`)
* **Member Subsystem**:
  * `SpringDataMemberRepository` extends `JpaRepository<Member, String>`
  * `SqlMemberRepository` implements `MemberRepository` (Annotated `@Primary`)
  * `SpringDataPlanRepository` extends `JpaRepository<Plan, String>`
  * `SqlPlanRepository` implements `PlanRepository` (Annotated `@Primary`)
* **Parking Subsystem**:
  * `SpringDataParkingSlotRepository` extends `JpaRepository<ParkingSlot, String>`
  * `SqlParkingSlotRepository` implements `ParkingSlotRepository` (Annotated `@Primary`)
  * `SpringDataParkingSessionRepository` extends `JpaRepository<ParkingSession, String>`
  * `SqlParkingSessionRepository` implements `ParkingSessionRepository` (Annotated `@Primary`)
  * `SpringDataZoneRepository` extends `JpaRepository<Zone, String>`
  * `SqlZoneRepository` implements `ZoneRepository` (Annotated `@Primary`)
* **Staff Subsystem**:
  * `SpringDataStaffRepository` extends `JpaRepository<Staff, String>`
  * `SqlStaffRepository` implements `StaffRepository` (Annotated `@Primary`)
* **Ticketing Subsystem**:
  * `SpringDataTicketRepository` extends `JpaRepository<Ticket, String>`
  * `SqlTicketRepository` implements `TicketRepository` (Annotated `@Primary`)
* **Problem Reporting Subsystem**:
  * `SpringDataProblemReportRepository` extends `JpaRepository<ProblemReport, Long>`
  * `SqlProblemReportRepository` implements `ProblemReportRepository` (Annotated `@Primary`)

---

## Verification Plan

### Compilation Check
* Run `mvn clean compile` to ensure all JPA dependencies, model annotations, and Autowire primary bindings are correctly linked.

### Database Initialization
* Check that starting the application automatically boots the H2 database, runs the DDL schema auto-updates, and populates mock records (which will be visible via the `/h2-console`).
