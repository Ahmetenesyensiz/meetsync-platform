package com.meetsync.meetingservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class PollRequest {
    @NotBlank
    private String question;

    private List<String> options;
}
