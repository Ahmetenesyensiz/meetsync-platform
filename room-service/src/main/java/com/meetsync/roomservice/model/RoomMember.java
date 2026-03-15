package com.meetsync.roomservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "room_members",
    uniqueConstraints = @UniqueConstraint(columnNames = {"room_id", "user_email"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomMember {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;
    
    @Column(nullable = false)
    private String userEmail;
    
    @Column(nullable = false)
    private String userName;
    
    @Enumerated(EnumType.STRING)
    private MemberRole memberRole;
    
    private LocalDateTime addedAt;
    
    @PrePersist
    public void prePersist() {
        addedAt = LocalDateTime.now();
        if (memberRole == null) memberRole = MemberRole.MEMBER;
    }
    
    public enum MemberRole {
        OWNER, ADMIN, MEMBER
    }
}
