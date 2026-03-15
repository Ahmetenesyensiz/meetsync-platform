package com.meetsync.meetingservice.controller;

import com.meetsync.meetingservice.dto.*;
import com.meetsync.meetingservice.model.*;
import com.meetsync.meetingservice.service.MeetingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MeetingController {

    private final MeetingService meetingService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "running", "service", "meeting-service"));
    }

    @PostMapping
    public ResponseEntity<Meeting> createMeeting(
            @Valid @RequestBody MeetingRequest req,
            HttpServletRequest request) {
        String email = (String) request.getAttribute("userEmail");
        String name = (String) request.getAttribute("userFullName");
        return ResponseEntity.ok(meetingService.createMeeting(req, email, name != null ? name : email));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Meeting>> getMyMeetings(HttpServletRequest request) {
        String email = (String) request.getAttribute("userEmail");
        return ResponseEntity.ok(meetingService.getMyMeetings(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Meeting> getMeeting(@PathVariable Long id) {
        return ResponseEntity.ok(meetingService.getMeeting(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Meeting> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(meetingService.updateStatus(id, body.get("status")));
    }

    @PostMapping("/{id}/respond")
    public ResponseEntity<Meeting> respond(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        String email = (String) request.getAttribute("userEmail");
        return ResponseEntity.ok(meetingService.respondToInvite(id, email, body.get("response")));
    }

    @PostMapping("/{id}/polls")
    public ResponseEntity<Poll> createPoll(
            @PathVariable Long id,
            @Valid @RequestBody PollRequest req) {
        return ResponseEntity.ok(meetingService.createPoll(id, req));
    }

    @PostMapping("/polls/{optionId}/vote")
    public ResponseEntity<PollOption> vote(@PathVariable Long optionId) {
        return ResponseEntity.ok(meetingService.vote(optionId));
    }

    @GetMapping("/{id}/polls")
    public ResponseEntity<List<Poll>> getPolls(@PathVariable Long id) {
        return ResponseEntity.ok(meetingService.getMeetingPolls(id));
    }
}
