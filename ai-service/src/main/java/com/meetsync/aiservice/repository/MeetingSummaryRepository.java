package com.meetsync.aiservice.repository;

import com.meetsync.aiservice.model.MeetingSummary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MeetingSummaryRepository extends JpaRepository<MeetingSummary, Long> {
    List<MeetingSummary> findByMeetingId(Long meetingId);
    List<MeetingSummary> findByRequestedBy(String email);
}
