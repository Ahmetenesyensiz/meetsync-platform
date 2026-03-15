package com.meetsync.roomservice.repository;

import com.meetsync.roomservice.model.RoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomMemberRepository extends JpaRepository<RoomMember, Long> {
    
    List<RoomMember> findByRoomId(Long roomId);
    
    List<RoomMember> findByUserEmail(String userEmail);
    
    Optional<RoomMember> findByRoomIdAndUserEmail(Long roomId, String userEmail);
    
    boolean existsByRoomIdAndUserEmail(Long roomId, String userEmail);
    
    void deleteByRoomIdAndUserEmail(Long roomId, String userEmail);
}
