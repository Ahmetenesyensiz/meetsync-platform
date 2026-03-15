package com.meetsync.notificationservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final EmailService emailService;
    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = "meeting-events", groupId = "notification-group")
    public void handleMeetingEvent(Map<String, Object> event) {
        try {
            String type = (String) event.get("type");
            log.info("Kafka eventi alindi: {}", type);

            if ("MEETING_CREATED".equals(type)) {
                handleMeetingCreated(event);
            }
        } catch (Exception e) {
            log.error("Event isleme hatasi: {}", e.getMessage());
        }
    }

    private void handleMeetingCreated(Map<String, Object> event) {
        String title = (String) event.get("title");
        String organizerEmail = (String) event.get("organizerEmail");
        String startTime = (String) event.get("startTime");
        Object participantsObj = event.get("participantEmails");

        // WebSocket ile anlık bildirim gönder
        Map<String, Object> notification = Map.of(
                "type", "MEETING_CREATED",
                "title", title,
                "message", "Yeni toplanti olusturuldu: " + title,
                "startTime", startTime
        );

        messagingTemplate.convertAndSend((String) "/topic/notifications", (Object) notification);
        log.info("WebSocket bildirimi gonderildi: {}", title);

        // Katılımcılara email gönder
        if (participantsObj instanceof List<?> participants) {
            for (Object emailObj : participants) {
                if (emailObj instanceof String email) {
                    emailService.sendMeetingInvite(email, organizerEmail, title, startTime, null, null);
                }
            }
        }
    }
}
