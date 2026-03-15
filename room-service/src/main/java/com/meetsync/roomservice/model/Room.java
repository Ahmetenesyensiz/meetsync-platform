package com.meetsync.roomservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String building;
    private String floor;
    private int capacity;
    private String description;
    private String imageUrl;
    private boolean hasProjector;
    private boolean hasWhiteboard;
    private boolean hasVideoConference;
    private boolean hasAirConditioning;

    @Enumerated(EnumType.STRING)
    private RoomStatus status;

    public enum RoomStatus {
        ACTIVE, MAINTENANCE, INACTIVE
    }
}
