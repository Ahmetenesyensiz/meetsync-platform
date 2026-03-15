package com.meetsync.roomservice.repository;

import com.meetsync.roomservice.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByOrganizerEmail(String email);
    List<Reservation> findByRoomId(Long roomId);

    @Query("""
            SELECT r FROM Reservation r
            WHERE r.room.id = :roomId
            AND r.status = 'CONFIRMED'
            AND r.startTime < :endTime
            AND r.endTime > :startTime
            """)
    List<Reservation> findConflicts(@Param("roomId") Long roomId,
                                     @Param("startTime") LocalDateTime startTime,
                                     @Param("endTime") LocalDateTime endTime);

    List<Reservation> findByRoomIdAndStartTimeBetween(Long roomId, LocalDateTime start, LocalDateTime end);
}
