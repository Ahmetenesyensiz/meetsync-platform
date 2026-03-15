package com.meetsync.roomservice.service;

import com.meetsync.roomservice.dto.*;
import com.meetsync.roomservice.model.*;
import com.meetsync.roomservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;
    private final RoomMemberRepository roomMemberRepository;

    public Room createRoom(RoomRequest req, String creatorEmail, String creatorName) {
        Room room = Room.builder()
                .name(req.getName())
                .building(req.getBuilding())
                .floor(req.getFloor())
                .capacity(req.getCapacity())
                .description(req.getDescription())
                .hasProjector(req.isHasProjector())
                .hasWhiteboard(req.isHasWhiteboard())
                .hasVideoConference(req.isHasVideoConference())
                .hasAirConditioning(req.isHasAirConditioning())
                .status(Room.RoomStatus.ACTIVE)
                .build();

        Room saved = roomRepository.save(room);

        RoomMember owner = RoomMember.builder()
                .room(saved)
                .userEmail(creatorEmail)
                .userName(creatorName)
                .memberRole(RoomMember.MemberRole.OWNER)
                .build();
        roomMemberRepository.save(owner);

        log.info("Oda olusturuldu: {} by {}", saved.getName(), creatorEmail);
        return saved;
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public List<Room> getAvailableRooms(LocalDateTime start, LocalDateTime end) {
        return roomRepository.findAvailableRooms(start, end);
    }

    public Reservation createReservation(ReservationRequest req, String email, String name) {
        Room room = roomRepository.findById(req.getRoomId())
                .orElseThrow(() -> new RuntimeException("Oda bulunamadi"));

        List<Reservation> conflicts = reservationRepository.findConflicts(
                req.getRoomId(), req.getStartTime(), req.getEndTime());

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Bu saatte oda dolu");
        }

        String qrCode = UUID.randomUUID().toString();

        Reservation reservation = Reservation.builder()
                .room(room)
                .organizerEmail(email)
                .organizerName(name)
                .title(req.getTitle())
                .description(req.getDescription())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .qrCode(qrCode)
                .checkedIn(false)
                .build();

        Reservation saved = reservationRepository.save(reservation);
        log.info("Rezervasyon olusturuldu: {} - {}", room.getName(), email);
        return saved;
    }

    public List<Reservation> getMyReservations(String email) {
        return reservationRepository.findByOrganizerEmail(email);
    }

    public List<Reservation> getRoomReservations(Long roomId) {
        return reservationRepository.findByRoomId(roomId);
    }

    public Reservation checkIn(String qrCode) {
        Reservation reservation = reservationRepository.findAll().stream()
                .filter(r -> qrCode.equals(r.getQrCode()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("QR kod gecersiz"));

        reservation.setCheckedIn(true);
        reservation.setCheckedInAt(LocalDateTime.now());
        return reservationRepository.save(reservation);
    }

    public Reservation cancelReservation(Long id, String email) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rezervasyon bulunamadi"));

        if (!reservation.getOrganizerEmail().equals(email)) {
            throw new RuntimeException("Bu rezervasyonu iptal etme yetkiniz yok");
        }

        reservation.setStatus(Reservation.ReservationStatus.CANCELLED);
        return reservationRepository.save(reservation);
    }

    public RoomMember addMember(Long roomId, AddMemberRequest req, String requestorEmail) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Oda bulunamadi"));

        boolean isOwnerOrAdmin = roomMemberRepository.findByRoomIdAndUserEmail(roomId, requestorEmail)
                .map(m -> m.getMemberRole() == RoomMember.MemberRole.OWNER ||
                          m.getMemberRole() == RoomMember.MemberRole.ADMIN)
                .orElse(false);

        if (!isOwnerOrAdmin) {
            throw new RuntimeException("Bu islemi yapmaya yetkiniz yok");
        }

        if (roomMemberRepository.existsByRoomIdAndUserEmail(roomId, req.getUserEmail())) {
            throw new RuntimeException("Bu kullanici zaten oda uyesi");
        }

        RoomMember.MemberRole role = RoomMember.MemberRole.MEMBER;
        if (req.getMemberRole() != null) {
            try { 
                role = RoomMember.MemberRole.valueOf(req.getMemberRole()); 
            } catch (Exception ignored) {}
        }

        RoomMember member = RoomMember.builder()
                .room(room)
                .userEmail(req.getUserEmail())
                .userName(req.getUserName())
                .memberRole(role)
                .build();

        return roomMemberRepository.save(member);
    }

    public void removeMember(Long roomId, String userEmail, String requestorEmail) {
        boolean isOwnerOrAdmin = roomMemberRepository.findByRoomIdAndUserEmail(roomId, requestorEmail)
                .map(m -> m.getMemberRole() == RoomMember.MemberRole.OWNER ||
                          m.getMemberRole() == RoomMember.MemberRole.ADMIN)
                .orElse(false);

        if (!isOwnerOrAdmin) {
            throw new RuntimeException("Bu islemi yapmaya yetkiniz yok");
        }

        roomMemberRepository.deleteByRoomIdAndUserEmail(roomId, userEmail);
        log.info("Uye cikarildi: {} from room {}", userEmail, roomId);
    }

    public List<RoomMember> getRoomMembers(Long roomId) {
        return roomMemberRepository.findByRoomId(roomId);
    }

    public List<Room> getMyRooms(String email) {
        return roomMemberRepository.findByUserEmail(email).stream()
                .map(RoomMember::getRoom)
                .collect(java.util.stream.Collectors.toList());
    }
}
