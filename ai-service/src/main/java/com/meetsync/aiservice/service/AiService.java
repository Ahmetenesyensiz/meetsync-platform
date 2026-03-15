package com.meetsync.aiservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.meetsync.aiservice.dto.SummaryRequest;
import com.meetsync.aiservice.model.MeetingSummary;
import com.meetsync.aiservice.repository.MeetingSummaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    private final MeetingSummaryRepository summaryRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${anthropic.api.key}")
    private String apiKey;

    public MeetingSummary generateSummary(SummaryRequest req, String userEmail) {
        try {
            String prompt = buildPrompt(req.getNotes(), req.getMeetingTitle());
            String aiResponse = callClaudeApi(prompt);

            String summary = extractSection(aiResponse, "ÖZET");
            String actionItems = extractSection(aiResponse, "AKSİYON MADDELERİ");
            String keyDecisions = extractSection(aiResponse, "ALINMIŞ KARARLAR");

            MeetingSummary result = MeetingSummary.builder()
                    .meetingId(req.getMeetingId())
                    .meetingTitle(req.getMeetingTitle())
                    .rawNotes(req.getNotes())
                    .summary(summary)
                    .actionItems(actionItems)
                    .keyDecisions(keyDecisions)
                    .requestedBy(userEmail)
                    .build();

            return summaryRepository.save(result);
        } catch (Exception e) {
            log.error("AI ozet hatasi: {}", e.getMessage());
            throw new RuntimeException("AI ozet olusturulamadi: " + e.getMessage());
        }
    }

    private String callClaudeApi(String prompt) throws Exception {
        HttpClient client = HttpClient.newHttpClient();

        Map<String, Object> body = Map.of(
                "model", "claude-sonnet-4-20250514",
                "max_tokens", 1024,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        String requestBody = objectMapper.writeValueAsString(body);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.anthropic.com/v1/messages"))
                .header("Content-Type", "application/json")
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request,
                HttpResponse.BodyHandlers.ofString());

        JsonNode json = objectMapper.readTree(response.body());
        return json.path("content").get(0).path("text").asText();
    }

    private String buildPrompt(String notes, String title) {
        return """
                Aşağıdaki toplantı notlarını analiz et ve Türkçe olarak yapılandır.
                
                Toplantı: %s
                
                Notlar:
                %s
                
                Lütfen şu başlıklar altında yanıt ver:
                
                ÖZET:
                [Toplantının kısa özeti]
                
                AKSİYON MADDELERİ:
                [Yapılması gereken görevler, sorumlu kişiler]
                
                ALINMIŞ KARARLAR:
                [Toplantıda alınan önemli kararlar]
                """.formatted(title != null ? title : "Toplantı", notes);
    }

    private String extractSection(String text, String section) {
        try {
            int start = text.indexOf(section + ":");
            if (start == -1) return text;

            start += section.length() + 1;
            int end = text.indexOf("\n\n", start);
            if (end == -1) end = text.length();

            return text.substring(start, end).trim();
        } catch (Exception e) {
            return text;
        }
    }

    public List<MeetingSummary> getMySummaries(String email) {
        return summaryRepository.findByRequestedBy(email);
    }

    public List<MeetingSummary> getMeetingSummaries(Long meetingId) {
        return summaryRepository.findByMeetingId(meetingId);
    }
}
