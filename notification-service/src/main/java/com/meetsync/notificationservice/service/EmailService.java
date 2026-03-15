package com.meetsync.notificationservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendMeetingInvite(String to, String organizerName,
                                   String title, String startTime,
                                   String roomName, String teamsLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Toplanti Daveti: " + title);
            helper.setText(buildInviteHtml(organizerName, title, startTime, roomName, teamsLink), true);

            mailSender.send(message);
            log.info("Davet emaili gonderildi: {}", to);
        } catch (Exception e) {
            log.error("Email gonderilemedi: {} - {}", to, e.getMessage());
        }
    }

    public void sendMeetingReminder(String to, String title, String startTime) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Hatirlatma: " + title + " 15 dakika sonra basliyor");
            helper.setText(buildReminderHtml(title, startTime), true);

            mailSender.send(message);
            log.info("Hatirlatma emaili gonderildi: {}", to);
        } catch (Exception e) {
            log.error("Hatirlatma emaili gonderilemedi: {} - {}", to, e.getMessage());
        }
    }

    private String buildInviteHtml(String organizer, String title,
                                    String startTime, String room, String teamsLink) {
        return """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px;border-radius:12px;">
                    <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;border-radius:8px;text-align:center;margin-bottom:20px;">
                        <h1 style="color:white;margin:0;font-size:24px;">MeetSync</h1>
                        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;">Toplanti Daveti</p>
                    </div>
                    <div style="background:white;padding:24px;border-radius:8px;margin-bottom:16px;">
                        <h2 style="color:#1a1a2e;margin-top:0;">%s</h2>
                        <table style="width:100%%;">
                            <tr><td style="color:#666;padding:8px 0;width:120px;">Duzenleyen</td><td style="font-weight:600;">%s</td></tr>
                            <tr><td style="color:#666;padding:8px 0;">Baslangic</td><td style="font-weight:600;">%s</td></tr>
                            <tr><td style="color:#666;padding:8px 0;">Oda</td><td style="font-weight:600;">%s</td></tr>
                        </table>
                        %s
                    </div>
                    <p style="text-align:center;color:#999;font-size:12px;">MeetSync - Kurumsal Toplanti Yonetimi</p>
                </div>
                """.formatted(
                title, organizer, startTime,
                room != null ? room : "Belirtilmedi",
                teamsLink != null ?
                        "<a href='" + teamsLink + "' style='display:block;margin-top:16px;padding:12px;background:#464775;color:white;text-align:center;border-radius:6px;text-decoration:none;'>Teams ile Katil</a>" : ""
        );
    }

    private String buildReminderHtml(String title, String startTime) {
        return """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                    <div style="background:linear-gradient(135deg,#f093fb,#f5576c);padding:24px;border-radius:8px;text-align:center;">
                        <h2 style="color:white;margin:0;">Toplanti Hatirlatmasi</h2>
                    </div>
                    <div style="padding:24px;background:white;">
                        <p style="font-size:18px;"><strong>%s</strong> toplantiniz 15 dakika sonra basliyor.</p>
                        <p style="color:#666;">Baslangic: %s</p>
                    </div>
                </div>
                """.formatted(title, startTime);
    }
}
