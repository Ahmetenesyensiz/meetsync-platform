package com.meetsync.meetingservice.repository;

import com.meetsync.meetingservice.model.Poll;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PollRepository extends JpaRepository<Poll, Long> {
    List<Poll> findByMeetingId(Long meetingId);
}
