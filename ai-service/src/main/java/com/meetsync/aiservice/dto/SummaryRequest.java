package com.meetsync.aiservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SummaryRequest {
    private Long meetingId;
    private String meetingTitle;

    @NotBlank
    private String notes;
}
