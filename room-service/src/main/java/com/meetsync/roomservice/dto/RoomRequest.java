package com.meetsync.roomservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RoomRequest {
    @NotBlank
    private String name;

    private String building;
    private String floor;

    @Min(1)
    private int capacity;

    private String description;
    private boolean hasProjector;
    private boolean hasWhiteboard;
    private boolean hasVideoConference;
    private boolean hasAirConditioning;
}
