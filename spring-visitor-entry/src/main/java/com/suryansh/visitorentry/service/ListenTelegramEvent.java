package com.suryansh.visitorentry.service;

import com.suryansh.visitorentry.entity.VisitingRecordEntity;
import com.suryansh.visitorentry.entity.VisitorsEntity;
import com.suryansh.visitorentry.exception.SpringVisitorException;
import com.suryansh.visitorentry.repository.VisitingRecordRepo;
import com.suryansh.visitorentry.repository.VisitorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class ListenTelegramEvent {
    private static final Logger logger = LoggerFactory.getLogger(ListenTelegramEvent.class);
    private final VisitingRecordRepo visitingRecordRepo;
    private final VisitorRepository visitRepository;

    public ListenTelegramEvent(VisitingRecordRepo visitingRecordRepo, VisitorRepository visitRepository) {
        this.visitingRecordRepo = visitingRecordRepo;
        this.visitRepository = visitRepository;
    }

    public String manageVisitorReq(String visitId, String visitStatus) {

        VisitingRecordEntity visitingRecordEntity = visitingRecordRepo.findById(visitId)
                .orElseThrow(() -> new SpringVisitorException(
                        "Unable to find Visiting Record Of Id " + visitId,
                        ErrorType.NOT_FOUND,
                        HttpStatus.NOT_FOUND));
        VisitorsEntity visitorEntity = visitRepository.findById(visitingRecordEntity.getVisitorId())
                .orElseThrow(() -> new SpringVisitorException("Unable to find visitor of id "+visitingRecordEntity.getVisitorId(),
                        ErrorType.NOT_FOUND, HttpStatus.NOT_FOUND));
        String visitorName = visitorEntity.getVisitorName();
        // 🚫 Already processed
        if (visitingRecordEntity.getStatus() != VisitingRecordEntity.Status.PENDING) {
            logger.warn("Visit {} already processed with status {}",
                    visitId, visitingRecordEntity.getStatus());

            return "⚠️ VisitorsEntity " + visitorName + " was already "
                    + visitingRecordEntity.getStatus().toString().toLowerCase();
        }
        // ✅ Process status
        if ("ACCEPT".equals(visitStatus)) {
            visitingRecordEntity.setStatus(VisitingRecordEntity.Status.ACCEPTED);
        } else if ("REJECT".equals(visitStatus)) {
            visitingRecordEntity.setStatus(VisitingRecordEntity.Status.REJECTED);
        } else {
            logger.warn("Invalid visit status {} for visit {}", visitStatus, visitId);
            return "❌ Invalid action for visitor " + visitorName;
        }
        try {
            visitingRecordRepo.save(visitingRecordEntity);
            // 🎯 Return proper message
            if (visitingRecordEntity.getStatus() == VisitingRecordEntity.Status.ACCEPTED) {
                return "✅ VisitorsEntity " + visitorName + " has been accepted.";
            } else {
                return "❌ VisitorsEntity " + visitorName + " has been rejected.";
            }
        } catch (Exception e) {
            logger.error("Unable to update status for visiting record {}", visitId, e);
            return "❌ Failed to update status for visitor " + visitorName;
        }
    }
}
