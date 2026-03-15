package com.meetsync.aiservice.controller;

import com.meetsync.aiservice.dto.SummaryRequest;
import com.meetsync.aiservice.model.MeetingSummary;
import com.meetsync.aiservice.service.AiService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiController {

    private final AiService aiService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "running", "service", "ai-service"));
    }

    @PostMapping("/summarize")
    public ResponseEntity<MeetingSummary> summarize(
            @Valid @RequestBody SummaryRequest req,
            HttpServletRequest request) {
        String email = (String) request.getAttribute("userEmail");
        return ResponseEntity.ok(aiService.generateSummary(req, email));
    }

    @GetMapping("/summaries/my")
    public ResponseEntity<List<MeetingSummary>> getMySummaries(HttpServletRequest request) {
        String email = (String) request.getAttribute("userEmail");
        return ResponseEntity.ok(aiService.getMySummaries(email));
    }

    @GetMapping("/summaries/meeting/{meetingId}")
    public ResponseEntity<List<MeetingSummary>> getMeetingSummaries(@PathVariable Long meetingId) {
        return ResponseEntity.ok(aiService.getMeetingSummaries(meetingId));
    }
}
