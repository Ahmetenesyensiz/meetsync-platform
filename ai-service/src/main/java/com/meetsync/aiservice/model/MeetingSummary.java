package com.meetsync.aiservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "meeting_summaries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingSummary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long meetingId;
    private String meetingTitle;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String rawNotes;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String summary;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String actionItems;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String keyDecisions;

    private String requestedBy;
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
