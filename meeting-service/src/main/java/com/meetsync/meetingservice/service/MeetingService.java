package com.meetsync.meetingservice.service;

import com.meetsync.meetingservice.dto.*;
import com.meetsync.meetingservice.model.*;
import com.meetsync.meetingservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public Meeting createMeeting(MeetingRequest req, String email, String name) {
        List<MeetingParticipant> participants = new ArrayList<>();
        if (req.getParticipantEmails() != null) {
            participants = req.getParticipantEmails().stream()
                    .map(e -> MeetingParticipant.builder()
                            .email(e)
                            .name(e)
                            .status(MeetingParticipant.ParticipantStatus.PENDING)
                            .build())
                    .collect(Collectors.toList());
        }

        String teamsLink = req.isGenerateTeamsLink() ?
                "https://teams.microsoft.com/l/meetup-join/" + UUID.randomUUID() : null;

        String meetLink = req.isGenerateMeetLink() ?
                "https://meet.google.com/" + UUID.randomUUID().toString().substring(0, 10) : null;

        Meeting meeting = Meeting.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .roomId(req.getRoomId())
                .roomName(req.getRoomName())
                .template(req.getTemplate() != null ? req.getTemplate() : Meeting.MeetingTemplate.CUSTOM)
                .organizerEmail(email)
                .organizerName(name)
                .teamsLink(teamsLink)
                .meetLink(meetLink)
                .participants(participants)
                .build();

        Meeting saved = meetingRepository.save(meeting);
        participants.forEach(p -> p.setMeeting(saved));
        meetingRepository.save(saved);

        // Kafka'ya event gönder
        Map<String, Object> event = new HashMap<>();
        event.put("type", "MEETING_CREATED");
        event.put("meetingId", saved.getId());
        event.put("title", saved.getTitle());
        event.put("organizerEmail", email);
        event.put("participantEmails", req.getParticipantEmails());
        event.put("startTime", saved.getStartTime().toString());
        kafkaTemplate.send("meeting-events", event);

        log.info("Toplanti olusturuldu: {} by {}", saved.getTitle(), email);
        return saved;
    }

    public List<Meeting> getMyMeetings(String email) {
        List<Meeting> organized = meetingRepository.findByOrganizerEmail(email);
        List<Meeting> participating = meetingRepository.findByParticipants_Email(email);

        Set<Long> seen = new HashSet<>();
        List<Meeting> all = new ArrayList<>();
        for (Meeting m : organized) { if (seen.add(m.getId())) all.add(m); }
        for (Meeting m : participating) { if (seen.add(m.getId())) all.add(m); }

        return all;
    }

    public Meeting getMeeting(Long id) {
        return meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Toplanti bulunamadi"));
    }

    public Meeting updateStatus(Long id, String status) {
        Meeting meeting = getMeeting(id);
        meeting.setStatus(Meeting.MeetingStatus.valueOf(status));
        return meetingRepository.save(meeting);
    }

    public Meeting respondToInvite(Long meetingId, String email, String response) {
        Meeting meeting = getMeeting(meetingId);
        meeting.getParticipants().stream()
                .filter(p -> p.getEmail().equals(email))
                .findFirst()
                .ifPresent(p -> p.setStatus(MeetingParticipant.ParticipantStatus.valueOf(response.toUpperCase())));
        return meetingRepository.save(meeting);
    }

    public Poll createPoll(Long meetingId, PollRequest req) {
        List<PollOption> options = req.getOptions().stream()
                .map(o -> PollOption.builder()
                        .optionText(o)
                        .voteCount(0)
                        .build())
                .collect(Collectors.toList());

        Poll poll = Poll.builder()
                .meetingId(meetingId)
                .question(req.getQuestion())
                .options(options)
                .active(true)
                .build();

        Poll saved = pollRepository.save(poll);
        options.forEach(o -> o.setPoll(saved));
        pollRepository.save(saved);

        return saved;
    }

    public PollOption vote(Long optionId) {
        PollOption option = pollOptionRepository.findById(optionId)
                .orElseThrow(() -> new RuntimeException("Secenek bulunamadi"));
        option.setVoteCount(option.getVoteCount() + 1);
        return pollOptionRepository.save(option);
    }

    public List<Poll> getMeetingPolls(Long meetingId) {
        return pollRepository.findByMeetingId(meetingId);
    }
}
