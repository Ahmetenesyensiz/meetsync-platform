package com.meetsync.meetingservice.dto;

import com.meetsync.meetingservice.model.Meeting;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class MeetingRequest {
    @NotBlank
    private String title;

    private String description;

    @NotNull
    private LocalDateTime startTime;

    @NotNull
    private LocalDateTime endTime;

    private Long roomId;
    private String roomName;
    private Meeting.MeetingTemplate template;
    private List<String> participantEmails;
    private boolean generateTeamsLink;
    private boolean generateMeetLink;
}
