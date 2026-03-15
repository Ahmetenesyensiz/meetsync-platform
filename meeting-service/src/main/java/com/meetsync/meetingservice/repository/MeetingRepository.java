package com.meetsync.meetingservice.repository;

import com.meetsync.meetingservice.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    List<Meeting> findByOrganizerEmail(String email);
    List<Meeting> findByParticipants_Email(String email);
}
