package com.suryansh.visitorentry.service;

import com.suryansh.visitorentry.dto.*;
import com.suryansh.visitorentry.entity.VisitingRecordDoc;
import com.suryansh.visitorentry.entity.VisitorDoc;
import com.suryansh.visitorentry.exception.SpringVisitorException;
import com.suryansh.visitorentry.model.AddNewVisitModel;
import com.suryansh.visitorentry.repository.VisitingRecordRepo;
import com.suryansh.visitorentry.repository.VisitorRepository;
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
import org.springframework.graphql.execution.ErrorType;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * This class is used for performing visit related operation.
 *
 * @author suryansh
 */
@Service
public class VisitorServiceImpl implements VisitorService {

    private static final Logger logger = LoggerFactory.getLogger(VisitorServiceImpl.class);
    private final VisitorRepository visitRepository;
    private final VisitingRecordRepo visitingRecordRepo;
    private final MongoTemplate mongoTemplate;
    private final TelegramService telegramService;
    private final MapperService mapperService;
    private final FileService fileService;

    public VisitorServiceImpl(VisitorRepository visitRepository, VisitingRecordRepo visitingRecordRepo, MongoTemplate mongoTemplate, TelegramService telegramService, MapperService mapperService, FileService fileService) {
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
    @CacheEvict(value = "visitsOnSpecificDate", allEntries = true)
    public CompletableFuture<String> addNewVisitInDb(AddNewVisitModel visitModel) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                Optional<VisitorDoc> visitorOptional = visitRepository.findByVisitorContact(visitModel.getVisitorContact());
                VisitorDoc visitorDoc;
                if (visitorOptional.isPresent()) {
                    visitorDoc = visitorOptional.get();
                    if (visitorDoc.getBanStatus() != null && Boolean.TRUE.equals(visitorDoc.getBanStatus().getIsVisitorBanned())) {
                        throw new SpringVisitorException("Visitor " + visitorDoc.getVisitorName() + " is banned on " + visitorDoc.getBanStatus().getBannedOn(), ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
                    }
                } else {
                    if (!fileService.checkFileExist(visitModel.getVisitorImage())) {
                        throw new SpringVisitorException("Image " + visitModel.getVisitorImage() + " does not exist !! Add image first", ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
                    }
                    visitorDoc = mapperService.mapAddNewVisitModelToEntity(visitModel);
                    visitorDoc = visitRepository.save(visitorDoc);
                }
                VisitingRecordDoc visitingRecordDoc = mapperService.mapAddNewVisitVisitingRecordToEntity(visitModel.getVisitingRecord());
                visitingRecordDoc.setStatus(VisitingRecordDoc.Status.PENDING);
                visitingRecordDoc.setVisitorId(visitorDoc.getId());

                ZonedDateTime nowInIndia = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
                visitingRecordDoc.setVisitedOn(nowInIndia.toInstant());

                visitingRecordDoc = visitingRecordRepo.save(visitingRecordDoc);

                TelegramMessageDto telegramMessage = new TelegramMessageDto(visitingRecordDoc.getId(), visitModel.getVisitorContact(), visitModel.getVisitorName(), visitModel.getVisitingRecord().getReason(), visitModel.getVisitorImage(), visitModel.getVisitingRecord().getVisitorHost(), visitModel.getVisitorAddress().getCity(), visitModel.getVisitorAddress().getLine1(), visitModel.getVisitorAddress().getPinCode());
                telegramService.sendVisitMessageToHost(telegramMessage);
                return "Visit successfully added for user " + visitModel.getVisitorName();
            } catch (SpringVisitorException e) {
                throw e;
            } catch (Exception e) {
                logger.error("Unable to add new visit {}", e.getMessage(), e);
                throw new SpringVisitorException("Unable to add new visit, " + e.getMessage(), ErrorType.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
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
            throw new SpringVisitorException("Visitor " + visitorDoc.getVisitorName() + " is already banned since " + visitorDoc.getBanStatus().getBannedOn(), ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
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
        query.fields().include("_id").include("visitorContact").include("visitorName").include("visitorImage").include("hasChildrenInSchool").include("lastVisitedOn").include("banStatus").include("visitorAddress").include("visitorChildren");

        VisitorDoc visitDocument = mongoTemplate.findOne(query, VisitorDoc.class);
        if (visitDocument == null) {
            throw new SpringVisitorException("Unable to find visitor with contact:- " + visitorContact, ErrorType.NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return mapperService.mapVisitEntityToDto(visitDocument);
    }

    @Override
    public VisitorDto getVisitorById(String visitorId) {
        VisitorDoc visitorDoc = visitRepository.findById(visitorId).orElseThrow(() -> new SpringVisitorException("Unable to find visitor with id:- " + visitorId, ErrorType.NOT_FOUND, HttpStatus.NOT_FOUND));
        return mapperService.mapVisitEntityToDto(visitorDoc);
    }

    @Override
    public VisitorDto handleUpdateVisitorProfile(VisitorDoc model) {
        // Fetch the existing visitor document from the repository
        VisitorDoc visitorDoc = visitRepository.findById(model.getId()).orElseThrow(() -> new SpringVisitorException("Unable to find visitor with id: " + model.getId(), ErrorType.NOT_FOUND, HttpStatus.NOT_FOUND));

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
                    throw new SpringVisitorException("Invalid Sort By field. Include only 'visitedOn, visitorHost or null", ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
            }
        }
        Pageable pageable;
        if (sortBy != null) {
            Sort.Direction direction = (sortOrder == null) ? Sort.Direction.ASC : Sort.Direction.valueOf(sortOrder);
            pageable = PageRequest.of(pageNumber, pageSize, Sort.by(direction, sortBy));
        } else {
            pageable = PageRequest.of(pageNumber, pageSize);
        }
        Page<VisitingRecordDoc> visitingRecordPage = visitingRecordRepo.findAllByVisitorId(id, pageable);

        // Construct and return the PaginationDto
        return new VisitingRecordPage(pageNumber, visitingRecordPage.getTotalPages(), visitingRecordPage.getContent(), pageSize, visitingRecordPage.getTotalElements());
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
                    throw new SpringVisitorException("Invalid Sort By field. Include only 'id, visitorContact, visitorName' or null", ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
            }
        }

        LocalDateTime startDay;
        LocalDateTime endDay;
        try {
            startDay = date.atStartOfDay();
            endDay = date.plusDays(1).atStartOfDay();
        } catch (DateTimeParseException e) {
            throw new SpringVisitorException("Invalid Date format. Use 'yyyy-MM-dd'.", ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
        }
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        return getVisitorInRange(startDay, endDay, pageable, sortBy, sortOrder);
    }

    @Override
    public PageResponse<VisitorDto> searchVisitor(VisitorFilterInput filter, PaginationInput pagination) {
        Query query = new Query();
        List<Criteria> criteria = new ArrayList<>();

        if (filter.visitorContact() != null) {
            criteria.add(Criteria.where("visitorContact").regex(filter.visitorContact(),"i"));
        }
        if (StringUtils.hasText(filter.visitorName())) {
            criteria.add(
                    Criteria.where("visitorName")
                            .regex(filter.visitorName(), "i")
            );
        }
        if (StringUtils.hasText(filter.visitorAddress())) {
            criteria.add(new Criteria().orOperator(Criteria.where("visitorAddress.line1").regex(filter.visitorAddress(), "i"), Criteria.where("visitorAddress.city").regex(filter.visitorAddress(), "i"), Criteria.where("visitorAddress.state").regex(filter.visitorAddress(), "i"), Criteria.where("visitorAddress.country").regex(filter.visitorAddress(), "i"), Criteria.where("visitorAddress.pinCode").regex(filter.visitorAddress(), "i")));
        }
        if (StringUtils.hasText(filter.visitorChildrenName())) {
            criteria.add(Criteria.where("visitorChildren.name").regex(filter.visitorChildrenName(), "i"));
        }
        if (!criteria.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[0])));
        }
        long totalData = mongoTemplate.count(query, VisitorDoc.class);
        String sortBy = StringUtils.hasText(pagination.sortBy()) ? pagination.sortBy() : "_id";
        Sort.Direction sortDirection = pagination.sortOrder() != null ? pagination.sortOrder() : Sort.Direction.DESC;
        int pageNo = Math.max(pagination.pageNo(), 0);
        int pageSize = pagination.pageSize() > 0 ? pagination.pageSize() : 10;
        query.with(Sort.by(sortDirection, sortBy));
        query.skip((long) pageNo * pageSize);
        query.limit(pageSize);
        List<VisitorDto> data = mongoTemplate.find(query, VisitorDoc.class).stream().map(mapperService::visitorDocToEntity).toList();
        if (data.isEmpty()) {
            return PageResponse.empty(pageNo, pageSize);
        }
        int totalPages = (int) Math.ceil((double) totalData / pageSize);
        return new PageResponse<>(pageNo, pageSize, totalData, totalPages, data);
    }

    @Override
    public PaginationDto handleGetVisitorsInPeriod(String from, String to, int pageSize, int pageNumber, String sortBy, String sortOrder) {
        LocalDateTime fromDate;
        LocalDateTime toDate;
        try {
            fromDate = LocalDate.parse(from).atStartOfDay();
            toDate = LocalDate.parse(to).atStartOfDay().plusDays(1);
        } catch (DateTimeParseException e) {
            throw new SpringVisitorException("Invalid Date format. Use 'yyyy-MM-dd'.", ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
        }
        if (sortBy != null) {
            switch (sortBy) {
                case "id":
                case "visitorContact":
                case "visitorName":
                case "visitedOn":
                    break;
                default:
                    throw new SpringVisitorException("Invalid Sort By field. Include only 'id, visitorContact, visitorName, visitedOn' or null", ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
            }
        }
        Pageable pageable = PageRequest.of(pageNumber, pageSize);

        return getVisitorInRange(fromDate, toDate, pageable, sortBy, sortOrder);
    }

    private PaginationDto getVisitorInRange(LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable, String sortBy, String sortOrder) {
        long totalRecords = mongoTemplate.count(Query.query(Criteria.where("visitedOn").gte(fromDate).lt(toDate).and("visitorId").ne(null)), "Visiting_Record");
        int totalPages = (int) Math.ceil((double) totalRecords / pageable.getPageSize());
        // Build the aggregation pipeline
        List<AggregationOperation> operations = new ArrayList<>();
        operations.add(Aggregation.match(Criteria.where("visitedOn").gte(fromDate).lt(toDate)));
        // Match for non-null visitor IDs
        operations.add(Aggregation.match(Criteria.where("visitorId").ne(null)));
        // Convert 'visitorId' to ObjectId for lookup
        operations.add(Aggregation.addFields().addField("visitorObjId").withValue(ConvertOperators.ToObjectId.toObjectId("$visitorId")).build());
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
        AggregationResults<VisitingRecordWithVisitorInfo> results = mongoTemplate.aggregate(aggregation, "Visiting_Record", VisitingRecordWithVisitorInfo.class);
        return new PaginationDto(pageable.getPageNumber(), totalPages, results.getMappedResults(), pageable.getPageSize(), (int) totalRecords);
    }

    @Override
    public PageResponse<VisitingRecordWithVisitorInfo> search(VisitFilterInput filter, PaginationInput pagination) {
        if (filter == null) {
            filter = new VisitFilterInput(
                    null, null, null, null, null, null, null,null
            );
        }

        if (pagination == null) {
            pagination = new PaginationInput(
                    0,
                    10,
                    "visitedOn",
                    Sort.Direction.DESC
            );
        }
        Query query = new Query();
        List<Criteria> criteria = new ArrayList<>();
        // Date Filter
        if (filter.fromDate() != null || filter.toDate() != null) {
            Criteria dateCriteria = Criteria.where("visitedOn");
            if (filter.fromDate() != null) {
                dateCriteria.gte(filter.fromDate().atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant());
            }
            if (filter.toDate() != null) {
                dateCriteria.lt(filter.toDate().plusDays(1).atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant());
            }
            criteria.add(dateCriteria);
        }
        // Status Filter
        if (filter.status() != null) {
            criteria.add(Criteria.where("status").is(filter.status()));
        }
        // Host Filter
        if (StringUtils.hasText(filter.visitorHost())) {
            criteria.add(Criteria.where("visitorHost").regex(Pattern.quote(filter.visitorHost()), "i"));
        }
        // Reason Filter
        if (StringUtils.hasText(filter.reason())) {
            criteria.add(Criteria.where("reason").regex(Pattern.quote(filter.reason()), "i"));
        }
        // Visitor Filter
        if (StringUtils.hasText(filter.visitorName()) || StringUtils.hasText(filter.visitorContact())) {
            List<String> visitorIds = visitRepository.findIdsByFilter(filter.visitorName(), filter.visitorContact());
            if (visitorIds.isEmpty()) {
                return PageResponse.empty(pagination.pageNo(), pagination.pageSize());
            }
            criteria.add(Criteria.where("visitorId").in(visitorIds));
        }
        if (StringUtils.hasText(filter.visitorId())) {
            criteria.add(Criteria.where("visitorId").is(filter.visitorId()));
        }
        // Combine Criteria
        if (!criteria.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[0])));
        }
        // Count Query
        Query countQuery = Query.of(query);
        long totalData = mongoTemplate.count(countQuery, VisitingRecordDoc.class);
        // Sorting
        String sortBy = StringUtils.hasText(pagination.sortBy()) ? pagination.sortBy() : "visitedOn";
        Sort.Direction sortDirection = pagination.sortOrder() != null ? pagination.sortOrder() : Sort.Direction.DESC;
        query.with(Sort.by(sortDirection, sortBy));
        // Pagination
        int pageNo = Math.max(pagination.pageNo(), 0);
        int pageSize = pagination.pageSize() > 0 ? pagination.pageSize() : 10;
        query.skip((long) pageNo * pageSize);
        query.limit(pageSize);
        // Fetch Data
        List<VisitingRecordDoc> visits = mongoTemplate.find(query, VisitingRecordDoc.class);
        // Map to DTO
        List<String> visitorIds = visits.stream().map(VisitingRecordDoc::getVisitorId).distinct().toList();

        Map<String, VisitorDoc> visitorMap = visitRepository.findAllById(visitorIds).stream().collect(Collectors.toMap(VisitorDoc::getId, Function.identity()));
        List<VisitingRecordWithVisitorInfo> data = visits.stream().map(visit -> {
            VisitorDoc visitor = visitorMap.get(visit.getVisitorId());
            return new VisitingRecordWithVisitorInfo(visit.getId(), visit.getVisitedOn(), visit.getReason(), visit.getVisitorHost(), visit.getStatus(), visit.getNote(), visitor == null ? null : new VisitingRecordWithVisitorInfo.VisitorInfo(visitor.getId(), visitor.getVisitorContact(), visitor.getVisitorName(), visitor.getVisitorImage()));
        }).toList();
        int totalPages = totalData == 0 ? 0 : (int) Math.ceil((double) totalData / pageSize);
        return new PageResponse<>(pageNo, pageSize, totalData, totalPages, data);
    }
}
