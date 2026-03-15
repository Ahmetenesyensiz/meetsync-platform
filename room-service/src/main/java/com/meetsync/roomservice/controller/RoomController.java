package com.meetsync.roomservice.controller;

import com.meetsync.roomservice.dto.*;
import com.meetsync.roomservice.model.*;
import com.meetsync.roomservice.repository.ReservationRepository;
import com.meetsync.roomservice.repository.RoomRepository;
import com.meetsync.roomservice.service.RoomService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RoomController {

    private final RoomService roomService;
    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "running", "service", "room-service"));
    }

    @PostMapping
    public ResponseEntity<Room> createRoom(@Valid @RequestBody RoomRequest req,
                                           HttpServletRequest request) {
        String email = (String) request.getAttribute("userEmail");
        String name = email;
        return ResponseEntity.ok(roomService.createRoom(req, email, name));
    }

    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/my")
    public ResponseEntity<List<Room>> getMyRooms(HttpServletRequest request) {
        String email = (String) request.getAttribute("userEmail");
        return ResponseEntity.ok(roomService.getMyRooms(email));
    }

    @GetMapping("/available")
    public ResponseEntity<List<Room>> getAvailable(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(roomService.getAvailableRooms(start, end));
    }

    @PostMapping("/reservations")
    public ResponseEntity<Reservation> createReservation(
            @Valid @RequestBody ReservationRequest req,
            HttpServletRequest request) {
        String email = (String) request.getAttribute("userEmail");
        String name = email;
        return ResponseEntity.ok(roomService.createReservation(req, email, name));
    }

    @GetMapping("/reservations/my")
    public ResponseEntity<List<Reservation>> getMyReservations(HttpServletRequest request) {
        String email = (String) request.getAttribute("userEmail");
        return ResponseEntity.ok(roomService.getMyReservations(email));
    }

    @GetMapping("/{roomId}/reservations")
    public ResponseEntity<List<Reservation>> getRoomReservations(@PathVariable Long roomId) {
        return ResponseEntity.ok(roomService.getRoomReservations(roomId));
    }

    @PostMapping("/checkin/{qrCode}")
    public ResponseEntity<Reservation> checkIn(@PathVariable String qrCode) {
        return ResponseEntity.ok(roomService.checkIn(qrCode));
    }

    @DeleteMapping("/reservations/{id}")
    public ResponseEntity<Reservation> cancelReservation(
            @PathVariable Long id,
            HttpServletRequest request) {
        String email = (String) request.getAttribute("userEmail");
        return ResponseEntity.ok(roomService.cancelReservation(id, email));
    }

    @GetMapping("/{roomId}/calendar/{year}/{month}")
    public ResponseEntity<Map<String, Object>> getRoomCalendar(
            @PathVariable Long roomId,
            @PathVariable int year,
            @PathVariable int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.atEndOfMonth().atTime(23, 59, 59);

        List<Reservation> reservations = reservationRepository.findByRoomIdAndStartTimeBetween(roomId, start, end);

        Map<String, List<Map<String, Object>>> byDay = new java.util.TreeMap<>();
        for (Reservation r : reservations) {
            if (r.getStatus() == Reservation.ReservationStatus.CANCELLED) continue;
            String day = r.getStartTime().toLocalDate().toString();
            byDay.computeIfAbsent(day, k -> new java.util.ArrayList<>()).add(Map.of(
                    "id", r.getId(),
                    "title", r.getTitle(),
                    "startTime", r.getStartTime().toString(),
                    "endTime", r.getEndTime().toString(),
                    "organizerEmail", r.getOrganizerEmail(),
                    "organizerName", r.getOrganizerName(),
                    "status", r.getStatus().name()
            ));
        }

        Room room = roomRepository.findById(roomId).orElseThrow(() -> new RuntimeException("Oda bulunamadi"));

        return ResponseEntity.ok(Map.of(
                "roomId", roomId,
                "roomName", room.getName(),
                "year", year,
                "month", month,
                "reservations", byDay,
                "totalReservations", reservations.size()
        ));
    }

    @GetMapping("/{roomId}/day/{date}")
    public ResponseEntity<List<Map<String, Object>>> getRoomDay(
            @PathVariable Long roomId,
            @PathVariable String date) {
        LocalDateTime start = LocalDate.parse(date).atStartOfDay();
        LocalDateTime end = LocalDate.parse(date).atTime(23, 59, 59);

        List<Reservation> reservations = reservationRepository.findByRoomIdAndStartTimeBetween(roomId, start, end);

        List<Map<String, Object>> result = reservations.stream()
                .filter(r -> r.getStatus() != Reservation.ReservationStatus.CANCELLED)
                .map(r -> new java.util.HashMap<String, Object>(Map.of(
                        "id", r.getId(),
                        "title", r.getTitle(),
                        "startTime", r.getStartTime().toString(),
                        "endTime", r.getEndTime().toString(),
                        "organizerEmail", r.getOrganizerEmail(),
                        "organizerName", r.getOrganizerName(),
                        "checkedIn", r.isCheckedIn()
                )))
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{roomId}/members")
    public ResponseEntity<List<RoomMember>> getRoomMembers(@PathVariable Long roomId) {
        return ResponseEntity.ok(roomService.getRoomMembers(roomId));
    }

    @PostMapping("/{roomId}/members")
    public ResponseEntity<RoomMember> addMember(@PathVariable Long roomId,
                                                @RequestBody AddMemberRequest req,
                                                HttpServletRequest request) {
        String email = (String) request.getAttribute("userEmail");
        return ResponseEntity.ok(roomService.addMember(roomId, req, email));
    }

    @DeleteMapping("/{roomId}/members/{userEmail}")
    public ResponseEntity<Map<String, String>> removeMember(@PathVariable Long roomId,
                                                            @PathVariable String userEmail,
                                                            HttpServletRequest request) {
        String requestorEmail = (String) request.getAttribute("userEmail");
        roomService.removeMember(roomId, userEmail, requestorEmail);
        return ResponseEntity.ok(Map.of("message", "Uye cikarildi"));
    }
}
