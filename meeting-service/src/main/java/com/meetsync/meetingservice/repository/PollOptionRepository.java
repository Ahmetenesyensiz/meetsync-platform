package com.meetsync.meetingservice.repository;

import com.meetsync.meetingservice.model.PollOption;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PollOptionRepository extends JpaRepository<PollOption, Long> {
}
