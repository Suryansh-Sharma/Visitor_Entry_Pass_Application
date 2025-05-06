package com.suryansh.visitorentry.service;

import com.suryansh.visitorentry.dto.*;
import com.suryansh.visitorentry.entity.VisitingRecordDoc;
import com.suryansh.visitorentry.entity.VisitorDoc;
import com.suryansh.visitorentry.exception.SpringVisitorException;
import com.suryansh.visitorentry.model.SearchFilter;
import com.suryansh.visitorentry.model.VisitModel;
import com.suryansh.visitorentry.repository.VisitRepository;
import com.suryansh.visitorentry.repository.VisitingRecordRepo;
import com.suryansh.visitorentry.service.interfaces.FileService;
import com.suryansh.visitorentry.service.interfaces.TelegramService;
import com.suryansh.visitorentry.service.interfaces.VisitorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.aggregation.ConvertOperators;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.regex.Pattern;

/**
 * This class is used for performing visit related operation.
 *
 * @author suryansh
 */
@Service
public class VisitorServiceImpl implements VisitorService {
    private static final Logger logger = LoggerFactory.getLogger(VisitorServiceImpl.class);
    private final VisitRepository visitRepository;
    private final VisitingRecordRepo visitingRecordRepo;
    private final MongoTemplate mongoTemplate;
    private final TelegramService telegramService;
    private final MapperService mapperService;
    private final FileService fileService;

    public VisitorServiceImpl(VisitRepository visitRepository, VisitingRecordRepo visitingRecordRepo,
                              MongoTemplate mongoTemplate, TelegramService telegramService,
                              MapperService mapperService, FileService fileService) {
        this.visitRepository = visitRepository;
        this.visitingRecordRepo = visitingRecordRepo;
        this.mongoTemplate = mongoTemplate;
        this.telegramService = telegramService;
        this.mapperService = mapperService;
        this.fileService = fileService;
    }

    @Override
    @Transactional
    @Async
    @CacheEvict(value = "visitsOnSpecificDate",allEntries = true)
    public CompletableFuture<String> addNewVisitInDb(VisitModel visitModel) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                Optional<VisitorDoc> visitDocumentOptional = visitRepository.findByVisitorContact(visitModel.getVisitorContact());
                VisitorDoc visitorDoc = visitDocumentOptional.orElse(new VisitorDoc());
                if (visitDocumentOptional.isPresent()) {
                    if (visitorDoc.getBanStatus() != null && visitorDoc.getBanStatus().getIsVisitorBanned()) {
                        throw new SpringVisitorException(
                                "Visitor " + visitorDoc.getVisitorName() + " is banned on " + visitorDoc.getBanStatus().getBannedOn(),
                                ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST
                        );
                    }
                }else {
                    if (!fileService.checkFileExist(visitModel.getVisitorImage())){
                        throw new SpringVisitorException("Image "+visitModel.getVisitorImage()+" does not exist !!, Add image first ",
                                ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
                    }
                    visitorDoc = mapperService.mapVisitModelToDoc(visitModel);
                    visitorDoc = visitRepository.save(visitorDoc);
                }

                VisitingRecordDoc visitingRecordDoc = mapperService.mapVisitingRecordModelToDoc(visitModel.getVisitingRecord());

                visitDocumentOptional
                        .ifPresent(document -> visitingRecordDoc.setVisitorId(document.getId()));
                if (visitDocumentOptional.isEmpty()) {
                    visitingRecordDoc.setVisitorId(visitorDoc.getId());
                }

                ZonedDateTime nowInIndia = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
                visitingRecordDoc.setVisitedOn(nowInIndia.toInstant());
                visitingRecordRepo.save(visitingRecordDoc);
                TelegramMessageDto telegramMessage = new TelegramMessageDto(
                        visitModel.getVisitorContact(), visitModel.getVisitorName(),
                        visitModel.getVisitingRecord().getReason(), visitModel.getVisitorImage(),
                        visitModel.getVisitingRecord().getVisitorHost(),
                        visitModel.getVisitorAddress().getCity(), visitModel.getVisitorAddress().getLine1(), visitModel.getVisitorAddress().getPinCode()
                );
                telegramService.sendVisitMessageToHost(telegramMessage);

                logger.info("New Visit is added for user {} to {} :addNewVisitPersonNotPresent",
                        visitModel.getVisitorName(), visitModel.getVisitingRecord().getVisitorHost());
                return "Visit is successfully added for user " + visitModel.getVisitorName();
            } catch (Exception e) {
                logger.error("Unable to add new visit :addNewVisitPersonNotPresent {}", e.toString());
                throw new SpringVisitorException("Unable to add new visit," + e.getMessage(), ErrorType.INTERNAL_ERROR,
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }

    @Override
    public String handleBanVisitor(String visitorId, String reason) {
        // Find the VisitorDoc by visitorId
        Optional<VisitorDoc> visitorDocOptional = visitRepository.findById(visitorId);
        if (visitorDocOptional.isEmpty()) {
            throw new SpringVisitorException("Visitor not found for ID: " + visitorId, ErrorType.NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        VisitorDoc visitorDoc = visitorDocOptional.get();
        if (visitorDoc.getBanStatus() != null && visitorDoc.getBanStatus().getIsVisitorBanned()) {
            throw new SpringVisitorException(
                    "Visitor " + visitorDoc.getVisitorName() + " is already banned since " + visitorDoc.getBanStatus().getBannedOn(),
                    ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST
            );
        }
        // Set the ban status
        VisitorDoc.BanStatus banStatus = new VisitorDoc.BanStatus();
        banStatus.setIsVisitorBanned(true);
        banStatus.setBannedOn(LocalDateTime.now());
        banStatus.setReason(reason);
        visitorDoc.setBanStatus(banStatus);
        visitRepository.save(visitorDoc);
        return "Visitor " + visitorDoc.getVisitorName() + " has been banned successfully.";
    }

    @Override
    public String handleBanUnVisitor(String visitorId) {
        // Find the VisitorDoc by visitorId
        Optional<VisitorDoc> visitorDocOptional = visitRepository.findById(visitorId);
        if (visitorDocOptional.isEmpty()) {
            throw new SpringVisitorException("Visitor not found for ID: " + visitorId, ErrorType.NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        VisitorDoc visitorDoc = visitorDocOptional.get();
        if (visitorDoc.getBanStatus() == null || !visitorDoc.getBanStatus().getIsVisitorBanned()) {
            return "Visitor " + visitorDoc.getVisitorName() + " is not currently banned.";
        }
        // Remove the ban status
        visitorDoc.setBanStatus(null);
        visitRepository.save(visitorDoc);
        return "Visitor " + visitorDoc.getVisitorName() + " has been unbanned successfully.";
    }

    @Override
    public VisitorDto getVisitorDetailByContact(String visitorContact) {
        Query query = new Query();
        query.addCriteria(Criteria.where("visitorContact").is(visitorContact));
        // Include specific fields you want to retrieve
        query.fields()
                .include("_id")
                .include("visitorContact")
                .include("visitorName")
                .include("visitorImage")
                .include("hasChildrenInSchool")
                .include("lastVisitedOn")
                .include("banStatus")
                .include("visitorAddress")
                .include("visitorChildren");

        VisitorDoc visitDocument = mongoTemplate.findOne(query, VisitorDoc.class);
        if (visitDocument == null) {
            throw new SpringVisitorException("Unable to find visitor with contact:- " + visitorContact, ErrorType.NOT_FOUND
                    , HttpStatus.NOT_FOUND);
        }
        return mapperService.mapVisitEntityToDto(visitDocument);
    }

    @Override
    public VisitorDto getVisitorById(String visitorId) {
        VisitorDoc visitorDoc = visitRepository.findById(visitorId)
                .orElseThrow(()->new SpringVisitorException("Unable to find visitor with id:- " + visitorId, ErrorType.NOT_FOUND
                        , HttpStatus.NOT_FOUND));
        return mapperService.mapVisitEntityToDto(visitorDoc);
    }

    @Override
    public VisitorDto handleUpdateVisitorProfile(VisitorDoc model) {
        // Fetch the existing visitor document from the repository
        VisitorDoc visitorDoc = visitRepository.findById(model.getId())
                .orElseThrow(() -> new SpringVisitorException("Unable to find visitor with id: " + model.getId(),
                        ErrorType.NOT_FOUND, HttpStatus.NOT_FOUND));

        // Update the visitor information
        visitorDoc.setVisitorContact(model.getVisitorContact());
        visitorDoc.setVisitorName(model.getVisitorName());
        visitorDoc.setVisitorImage(model.getVisitorImage());
        visitorDoc.setHasChildrenInSchool(model.getHasChildrenInSchool());
        visitorDoc.setVisitorChildren(model.getVisitorChildren());
        if (!model.getHasChildrenInSchool()) {
            visitorDoc.setVisitorChildren(null);
        }
        visitorDoc.setVisitorAddress(model.getVisitorAddress());

        if (model.getBanStatus() != null && model.getBanStatus().getIsVisitorBanned()) {
            VisitorDoc.BanStatus banStatus = new VisitorDoc.BanStatus();
            banStatus.setIsVisitorBanned(true);
            banStatus.setBannedOn(LocalDateTime.now());
            banStatus.setReason(model.getBanStatus().getReason());

            visitorDoc.setBanStatus(banStatus);
        } else {
            visitorDoc.setBanStatus(null);
        }
        try {
            VisitorDoc updatedVisitorDoc = visitRepository.save(visitorDoc);
            return mapperService.mapVisitEntityToDto(updatedVisitorDoc);
        } catch (Exception e) {
            logger.error("Unable to update visitor profile for id {}: {}", model.getId(), e.toString());
            throw new SpringVisitorException("Unable to update visitor", ErrorType.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @Override
    public VisitingRecordPage visitsOfVisitor(String id, int pageNumber, int pageSize, String sortBy, String sortOrder) {
        if (sortBy != null) {
            switch (sortBy) {
                case "visitedOn":
                case "status":
                case "visitorHost":
                    break;
                default:
                    throw new SpringVisitorException("Invalid Sort By field. Include only 'visitedOn, visitorHost or null",
                            ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
            }
        }
        Pageable pageable;
        if (sortBy!=null){
            Sort.Direction direction = (sortOrder == null) ? Sort.Direction.ASC : Sort.Direction.valueOf(sortOrder);
            pageable = PageRequest.of(pageNumber, pageSize, Sort.by(direction, sortBy));
        }else {
            pageable = PageRequest.of(pageNumber, pageSize);
        }
        Page<VisitingRecordDoc> visitingRecordPage = visitingRecordRepo.findAllByVisitorId(id, pageable);

        // Construct and return the PaginationDto
        return new VisitingRecordPage(
                pageNumber,
                visitingRecordPage.getTotalPages(),
                visitingRecordPage.getContent(),
                pageSize,
                visitingRecordPage.getTotalElements()
        );
    }

    @Override
    public PaginationDto getVisitorOnSpecificDate(LocalDate date, int pageSize, int pageNumber, String sortBy, String sortOrder) {
        // Validate the sortBy field
        if (sortBy != null) {
            switch (sortBy) {
                case "id":
                case "visitorContact":
                case "visitedOn":
                case "visitorName":
                    break;
                default:
                    throw new SpringVisitorException("Invalid Sort By field. Include only 'id, visitorContact, visitorName' or null",
                            ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
            }
        }

        LocalDateTime startDay;
        LocalDateTime endDay;
        try {
            startDay = date.atStartOfDay();
            endDay = date.plusDays(1).atStartOfDay();
        } catch (DateTimeParseException e) {
            throw new SpringVisitorException("Invalid Date format. Use 'yyyy-MM-dd'.",
                    ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
        }
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        return getVisitorInRange(startDay, endDay, pageable, sortBy, sortOrder);
    }


    @Override
    public VisitingRecordPage searchVisitor(List<SearchFilter> filters, int pageSize, int pageNumber,
                                            String sortBy, String sortOrder) {
//        logger.info("Filter {} ", filters.toString());
        if (sortBy != null) {
            switch (sortBy) {
                case "id":
                case "visitorContact":
                case "visitorName":
                    break;
                default:
                    throw new SpringVisitorException("Invalid Sort By field. Include only 'id, visitorContact, visitorName' or null",
                            ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
            }
        }
        Pageable pageable ;
        if (sortBy!=null){
            Sort.Direction direction = (sortOrder == null) ? Sort.Direction.ASC : Sort.Direction.valueOf(sortOrder);
            pageable = PageRequest.of(pageNumber, pageSize, Sort.by(direction, sortBy));
        }else{
           pageable = PageRequest.of(pageNumber, pageSize);
        }

        Query query = new Query().with(pageable);
        filters.forEach((filter) -> {
            switch (filter.key()) {
                case "Name":
                    query.addCriteria(Criteria.where("visitorName").regex(Pattern.compile(Pattern.quote(filter.value()) + ".*", Pattern.CASE_INSENSITIVE)));
                    break;
                case "Contact":
                    query.addCriteria(Criteria.where("visitorContact").regex(Pattern.compile(Pattern.quote(filter.value()) + ".*", Pattern.CASE_INSENSITIVE)));
                    break;
                case "Address": {
                    query.addCriteria(
                            new Criteria().orOperator(
                                    Criteria.where("visitorAddress.line1").regex(Pattern.compile(Pattern.quote(filter.value()) + ".*", Pattern.CASE_INSENSITIVE)),
                                    Criteria.where("visitorAddress.city").regex(Pattern.compile(Pattern.quote(filter.value()) + ".*", Pattern.CASE_INSENSITIVE))
                            )
                    );
                    break;
                }

                case "IsUserBanned": {
                    if (!filter.value().equals("true") && !filter.value().equals("false")) {
                        throw new SpringVisitorException("User 'true' or 'false' only for IsUserBanned", ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
                    }
                    Boolean bool = Boolean.parseBoolean(filter.value());
                    query.addCriteria(Criteria.where("banStatus.isVisitorBanned").is(bool));
                    break;
                }
                default:
                    throw new SpringVisitorException("Invalid filter key: Only Name, Contact, Address, ChildName are allowed!",
                            ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
            }
        });
        query.fields()
                .include("_id")
                .include("visitorContact")
                .include("visitorName")
                .include("visitorImage")
                .include("banStatus")
                .include("visitorAddress")
                .include("visitorChildren")
        ;
        Page<VisitorDoc> visitDocumentPage = PageableExecutionUtils.getPage(
                mongoTemplate.find(query, VisitorDoc.class
                ), pageable, () -> mongoTemplate.count(query.skip(0).limit(0), VisitorDoc.class)
        );
        return new VisitingRecordPage(
                pageNumber,
                visitDocumentPage.getTotalPages(),
                visitDocumentPage.getContent(),
                pageSize,
                visitDocumentPage.getTotalElements()
        );
    }

    @Override
    public PaginationDto handleGetVisitorsInPeriod(String from, String to, int pageSize, int pageNumber, String sortBy, String sortOrder) {
        LocalDateTime fromDate;
        LocalDateTime toDate;
        try {
            fromDate = LocalDate.parse(from).atStartOfDay();
            toDate = LocalDate.parse(to).atStartOfDay().plusDays(1);
        } catch (DateTimeParseException e) {
            throw new SpringVisitorException("Invalid Date format. Use 'yyyy-MM-dd'.",
                    ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
        }

        if (sortBy != null) {
            switch (sortBy) {
                case "id":
                case "visitorContact":
                case "visitorName":
                case "visitedOn":
                    break;
                default:
                    throw new SpringVisitorException("Invalid Sort By field. Include only 'id, visitorContact, visitorName, visitedOn' or null",
                            ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
            }
        }
        Pageable pageable = PageRequest.of(pageNumber, pageSize);

        return getVisitorInRange(fromDate, toDate, pageable, sortBy, sortOrder);
    }

    private PaginationDto getVisitorInRange(LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable, String sortBy, String sortOrder) {
        long totalRecords = mongoTemplate.count(
                Query.query(Criteria.where("visitedOn").gte(fromDate).lt(toDate)
                        .and("visitorId").ne(null)),
                "Visiting_Record"
        );
        int totalPages = (int) Math.ceil((double) totalRecords / pageable.getPageSize());
        // Build the aggregation pipeline
        List<AggregationOperation> operations = new ArrayList<>();
        operations.add(Aggregation.match(Criteria.where("visitedOn").gte(fromDate).lt(toDate)));

        // Match for non-null visitor IDs
        operations.add(Aggregation.match(Criteria.where("visitorId").ne(null)));
        // Convert 'visitorId' to ObjectId for lookup
        operations.add(Aggregation.addFields()
                .addField("visitorObjId")
                .withValue(ConvertOperators.ToObjectId.toObjectId("$visitorId"))
                .build());

        // Lookup operation to join with the 'Visit_Document' collection
        operations.add(Aggregation.lookup("Visitor_Document", "visitorObjId", "_id", "visitorInfo"));

        // Unwind the visitorInfo array to flatten the structure
        operations.add(Aggregation.unwind("visitorInfo", true));

        // Sort stage
        if (sortBy != null && sortOrder != null) {
            Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC;
            operations.add(Aggregation.sort(direction.equals(Sort.Direction.ASC) ? Sort.by(sortBy) : Sort.by(sortBy).descending()));
        }

        // Pagination stage
        operations.add(Aggregation.skip((long) pageable.getPageSize() * pageable.getPageNumber()));
        operations.add(Aggregation.limit(pageable.getPageSize()));

        // Create the aggregation
        Aggregation aggregation = Aggregation.newAggregation(operations);
        // Execute the aggregation
        AggregationResults<VisitingRecordWithVisitorInfo> results =
                mongoTemplate.aggregate(aggregation, "Visiting_Record", VisitingRecordWithVisitorInfo.class);


        return new PaginationDto(
                pageable.getPageNumber(),
                totalPages,
                results.getMappedResults(),
                pageable.getPageSize(),
                (int) totalRecords
        );
    }

}
