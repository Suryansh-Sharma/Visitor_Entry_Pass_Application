package com.suryansh.visitorentry.service;

import com.suryansh.visitorentry.entity.VisitingRecordDoc;
import com.suryansh.visitorentry.entity.VisitorDoc;
import com.suryansh.visitorentry.exception.SpringVisitorException;
import com.suryansh.visitorentry.repository.VisitRepository;
import com.suryansh.visitorentry.repository.VisitingRecordRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class ListenTelegramEvent {
    private static final Logger logger = LoggerFactory.getLogger(ListenTelegramEvent.class);
    private final VisitingRecordRepo visitingRecordRepo;
    private final VisitRepository visitRepository;

    public ListenTelegramEvent(VisitingRecordRepo visitingRecordRepo, VisitRepository visitRepository) {
        this.visitingRecordRepo = visitingRecordRepo;
        this.visitRepository = visitRepository;
    }

    public String manageVisitorReq(String visitId, String visitStatus) {

        VisitingRecordDoc visitingRecordDoc = visitingRecordRepo.findById(visitId)
                .orElseThrow(() -> new SpringVisitorException(
                        "Unable to find Visiting Record Of Id " + visitId,
                        ErrorType.NOT_FOUND,
                        HttpStatus.NOT_FOUND));
        VisitorDoc visitorDoc = visitRepository.findById(visitingRecordDoc.getVisitorId())
                .orElseThrow(() -> new SpringVisitorException("Unable to find visitor of id "+visitingRecordDoc.getVisitorId(),
                        ErrorType.NOT_FOUND, HttpStatus.NOT_FOUND));
        String visitorName = visitorDoc.getVisitorName();
        // 🚫 Already processed
        if (visitingRecordDoc.getStatus() != VisitingRecordDoc.Status.PENDING) {
            logger.warn("Visit {} already processed with status {}",
                    visitId, visitingRecordDoc.getStatus());

            return "⚠️ Visitor " + visitorName + " was already "
                    + visitingRecordDoc.getStatus().toString().toLowerCase();
        }
        // ✅ Process status
        if ("ACCEPT".equals(visitStatus)) {
            visitingRecordDoc.setStatus(VisitingRecordDoc.Status.ACCEPTED);
        } else if ("REJECT".equals(visitStatus)) {
            visitingRecordDoc.setStatus(VisitingRecordDoc.Status.REJECTED);
        } else {
            logger.warn("Invalid visit status {} for visit {}", visitStatus, visitId);
            return "❌ Invalid action for visitor " + visitorName;
        }
        try {
            visitingRecordRepo.save(visitingRecordDoc);
            // 🎯 Return proper message
            if (visitingRecordDoc.getStatus() == VisitingRecordDoc.Status.ACCEPTED) {
                return "✅ Visitor " + visitorName + " has been accepted.";
            } else {
                return "❌ Visitor " + visitorName + " has been rejected.";
            }
        } catch (Exception e) {
            logger.error("Unable to update status for visiting record {}", visitId, e);
            return "❌ Failed to update status for visitor " + visitorName;
        }
    }
}
