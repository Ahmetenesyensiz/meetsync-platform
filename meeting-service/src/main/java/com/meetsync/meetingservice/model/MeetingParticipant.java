package com.meetsync.meetingservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "meeting_participants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "meeting_id")
    private Meeting meeting;

    private String email;
    private String name;

    @Enumerated(EnumType.STRING)
    private ParticipantStatus status;

    public enum ParticipantStatus {
        PENDING, ACCEPTED, DECLINED
    }
}
