package com.meetsync.roomservice.repository;

import com.meetsync.roomservice.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByStatus(Room.RoomStatus status);

    @Query("""
            SELECT r FROM Room r WHERE r.status = 'ACTIVE'
            AND r.id NOT IN (
                SELECT res.room.id FROM Reservation res
                WHERE res.status = 'CONFIRMED'
                AND res.startTime < :endTime
                AND res.endTime > :startTime
            )
            """)
    List<Room> findAvailableRooms(@Param("startTime") LocalDateTime startTime,
                                   @Param("endTime") LocalDateTime endTime);
}
