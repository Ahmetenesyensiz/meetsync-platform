package com.meetsync.meetingservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "meetings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Meeting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;
    private String organizerEmail;
    private String organizerName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long roomId;
    private String roomName;

    @Enumerated(EnumType.STRING)
    private MeetingTemplate template;

    @Enumerated(EnumType.STRING)
    private MeetingStatus status;

    private String teamsLink;
    private String meetLink;
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<MeetingParticipant> participants;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) status = MeetingStatus.SCHEDULED;
    }

    public enum MeetingTemplate {
        SCRUM, ONE_ON_ONE, ALL_HANDS, BRAINSTORM, RETROSPECTIVE, CUSTOM
    }

    public enum MeetingStatus {
        SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    }
}
