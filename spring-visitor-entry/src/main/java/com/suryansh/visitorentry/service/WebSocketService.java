package com.suryansh.visitorentry.service;

import com.suryansh.visitorentry.dto.NotifyVisitStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService {
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendVisitUpdate(String visitId, String status, String message) {
        NotifyVisitStatus visitStatus=new NotifyVisitStatus(visitId,status,message);
        messagingTemplate.convertAndSend("/topic/visits",visitStatus);
    }
}
