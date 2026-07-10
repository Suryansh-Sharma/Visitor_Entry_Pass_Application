package com.suryansh.visitorentry.service;

import com.suryansh.visitorentry.dto.*;
import com.suryansh.visitorentry.entity.VisitingRecordEntity;
import com.suryansh.visitorentry.entity.VisitorsEntity;
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
import org.springframework.data.jpa.domain.Specification;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;
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
    private final TelegramService telegramService;
    private final MapperService mapperService;
    private final FileService fileService;

    public VisitorServiceImpl(VisitorRepository visitRepository, VisitingRecordRepo visitingRecordRepo, TelegramService telegramService, MapperService mapperService, FileService fileService) {
        this.visitRepository = visitRepository;
        this.visitingRecordRepo = visitingRecordRepo;
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
                Optional<VisitorsEntity> visitorOptional = visitRepository.findByVisitorContact(visitModel.getVisitorContact());
                VisitorsEntity visitorDoc;
                if (visitorOptional.isPresent()) {
                    visitorDoc = visitorOptional.get();
                    if (visitorDoc.getBanStatus() != null && Boolean.TRUE.equals(visitorDoc.getBanStatus().getIsVisitorBanned())) {
                        throw new SpringVisitorException("VisitorsEntity " + visitorDoc.getVisitorName() + " is banned on " + visitorDoc.getBanStatus().getBannedOn(), ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
                    }
                } else {
                    if (!fileService.checkFileExist(visitModel.getVisitorImage())) {
                        throw new SpringVisitorException("Image " + visitModel.getVisitorImage() + " does not exist !! Add image first", ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
                    }
                    visitorDoc = mapperService.mapAddNewVisitModelToEntity(visitModel);
                    attachChildren(visitorDoc);
                    visitorDoc = visitRepository.save(visitorDoc);
                }
                VisitingRecordEntity visitingRecordDoc = mapperService.mapAddNewVisitVisitingRecordToEntity(visitModel.getVisitingRecord());
                visitingRecordDoc.setStatus(VisitingRecordEntity.Status.PENDING);
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
        Optional<VisitorsEntity> visitorDocOptional = visitRepository.findById(visitorId);
        if (visitorDocOptional.isEmpty()) {
            throw new SpringVisitorException("VisitorsEntity not found for ID: " + visitorId, ErrorType.NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        VisitorsEntity visitorDoc = visitorDocOptional.get();
        if (visitorDoc.getBanStatus() != null && visitorDoc.getBanStatus().getIsVisitorBanned()) {
            throw new SpringVisitorException("VisitorsEntity " + visitorDoc.getVisitorName() + " is already banned since " + visitorDoc.getBanStatus().getBannedOn(), ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
        }
        // Set the ban status
        VisitorsEntity.BanStatus banStatus = new VisitorsEntity.BanStatus();
        banStatus.setIsVisitorBanned(true);
        banStatus.setBannedOn(LocalDateTime.now());
        banStatus.setReason(reason);
        visitorDoc.setBanStatus(banStatus);
        visitRepository.save(visitorDoc);
        return "VisitorsEntity " + visitorDoc.getVisitorName() + " has been banned successfully.";
    }

    @Override
    public String handleBanUnVisitor(String visitorId) {
        Optional<VisitorsEntity> visitorDocOptional = visitRepository.findById(visitorId);
        if (visitorDocOptional.isEmpty()) {
            throw new SpringVisitorException("VisitorsEntity not found for ID: " + visitorId, ErrorType.NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        VisitorsEntity visitorDoc = visitorDocOptional.get();
        if (visitorDoc.getBanStatus() == null || !visitorDoc.getBanStatus().getIsVisitorBanned()) {
            return "VisitorsEntity " + visitorDoc.getVisitorName() + " is not currently banned.";
        }
        // Remove the ban status
        visitorDoc.setBanStatus(null);
        visitRepository.save(visitorDoc);
        return "VisitorsEntity " + visitorDoc.getVisitorName() + " has been unbanned successfully.";
    }

    @Override
    @Transactional(readOnly = true)
    public VisitorDto getVisitorDetailByContact(String visitorContact) {
        VisitorsEntity visitDocument = visitRepository.findByVisitorContact(visitorContact)
                .orElseThrow(() -> new SpringVisitorException("Unable to find visitor with contact:- " + visitorContact, ErrorType.NOT_FOUND, HttpStatus.NOT_FOUND));
        return mapperService.mapVisitEntityToDto(visitDocument);
    }

    @Override
    @Transactional(readOnly = true)
    public VisitorDto getVisitorById(String visitorId) {
        VisitorsEntity visitorDoc = visitRepository.findById(visitorId).orElseThrow(() -> new SpringVisitorException("Unable to find visitor with id:- " + visitorId, ErrorType.NOT_FOUND, HttpStatus.NOT_FOUND));
        return mapperService.mapVisitEntityToDto(visitorDoc);
    }

    @Override
    @Transactional
    public VisitorDto handleUpdateVisitorProfile(VisitorsEntity model) {
        // Fetch the existing visitor document from the repository
        VisitorsEntity visitorDoc = visitRepository.findById(model.getId()).orElseThrow(() -> new SpringVisitorException("Unable to find visitor with id: " + model.getId(), ErrorType.NOT_FOUND, HttpStatus.NOT_FOUND));

        // Update the visitor information
        visitorDoc.setVisitorContact(model.getVisitorContact());
        visitorDoc.setVisitorName(model.getVisitorName());
        visitorDoc.setVisitorImage(model.getVisitorImage());
        visitorDoc.setHasChildrenInSchool(Boolean.TRUE.equals(model.getHasChildrenInSchool()));
        visitorDoc.getVisitorChildren().clear();
        if (Boolean.TRUE.equals(model.getHasChildrenInSchool()) && model.getVisitorChildren() != null) {
            model.getVisitorChildren().forEach(child -> {
                child.setVisitor(visitorDoc);
                visitorDoc.getVisitorChildren().add(child);
            });
        }
        visitorDoc.setVisitorAddress(model.getVisitorAddress());

        if (model.getBanStatus() != null && model.getBanStatus().getIsVisitorBanned()) {
            VisitorsEntity.BanStatus banStatus = new VisitorsEntity.BanStatus();
            banStatus.setIsVisitorBanned(true);
            banStatus.setBannedOn(LocalDateTime.now());
            banStatus.setReason(model.getBanStatus().getReason());

            visitorDoc.setBanStatus(banStatus);
        } else {
            visitorDoc.setBanStatus(null);
        }
        try {
            VisitorsEntity updatedVisitorDoc = visitRepository.save(visitorDoc);
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
        Page<VisitingRecordEntity> visitingRecordPage = visitingRecordRepo.findAllByVisitorId(id, pageable);

        // Construct and return the PaginationDto
        return new VisitingRecordPage(pageNumber, visitingRecordPage.getTotalPages(), visitingRecordPage.getContent(), pageSize, visitingRecordPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<VisitorDto> searchVisitor(VisitorFilterInput filter, PaginationInput pagination) {
        if (filter == null) {
            filter = new VisitorFilterInput(null, null, null, null);
        }
        if (pagination == null) {
            pagination = new PaginationInput(0, 10, "id", Sort.Direction.DESC);
        }
        Specification<VisitorsEntity> spec = visitorSpec(filter);
        int pageNo = Math.max(pagination.pageNo(), 0);
        int pageSize = pagination.pageSize() > 0 ? pagination.pageSize() : 10;
        String sortBy = StringUtils.hasText(pagination.sortBy()) ? normalizeVisitorSortBy(pagination.sortBy()) : "id";
        Sort.Direction sortDirection = pagination.sortOrder() != null ? pagination.sortOrder() : Sort.Direction.DESC;
        Page<VisitorsEntity> page = visitRepository.findAll(spec, PageRequest.of(pageNo, pageSize, Sort.by(sortDirection, sortBy)));
        List<VisitorDto> data = page.getContent().stream().map(mapperService::visitorDocToEntity).toList();
        if (data.isEmpty()) {
            return PageResponse.empty(pageNo, pageSize);
        }
        return new PageResponse<>(pageNo, pageSize, page.getTotalElements(), page.getTotalPages(), data);
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
        Specification<VisitingRecordEntity> spec = visitSpec(filter);
        if (StringUtils.hasText(filter.visitorName()) || StringUtils.hasText(filter.visitorContact())) {
            List<String> visitorIds = visitRepository.findIdsByFilter(filter.visitorName(), filter.visitorContact());
            if (visitorIds.isEmpty()) {
                return PageResponse.empty(pagination.pageNo(), pagination.pageSize());
            }
            spec = spec.and((root, query, cb) -> root.get("visitorId").in(visitorIds));
        }
        if (StringUtils.hasText(filter.visitorId())) {
            String visitorId = filter.visitorId();
            spec = spec.and((root, query, cb) -> cb.equal(root.get("visitorId"), visitorId));
        }
        String sortBy = StringUtils.hasText(pagination.sortBy()) ? pagination.sortBy() : "visitedOn";
        Sort.Direction sortDirection = pagination.sortOrder() != null ? pagination.sortOrder() : Sort.Direction.DESC;
        int pageNo = Math.max(pagination.pageNo(), 0);
        int pageSize = pagination.pageSize() > 0 ? pagination.pageSize() : 10;
        Page<VisitingRecordEntity> page = visitingRecordRepo.findAll(spec, PageRequest.of(pageNo, pageSize, Sort.by(sortDirection, sortBy)));
        List<VisitingRecordEntity> visits = page.getContent();
        List<String> visitorIds = visits.stream().map(VisitingRecordEntity::getVisitorId).distinct().toList();

        Map<String, VisitorsEntity> visitorMap = visitRepository.findAllById(visitorIds).stream().collect(Collectors.toMap(VisitorsEntity::getId, Function.identity()));
        List<VisitingRecordWithVisitorInfo> data = visits.stream().map(visit -> {
            VisitorsEntity visitor = visitorMap.get(visit.getVisitorId());
            return new VisitingRecordWithVisitorInfo(visit.getId(), visit.getVisitedOn(), visit.getReason(), visit.getVisitorHost(), visit.getStatus(), visit.getNote(), visitor == null ? null : new VisitingRecordWithVisitorInfo.VisitorInfo(visitor.getId(), visitor.getVisitorContact(), visitor.getVisitorName(), visitor.getVisitorImage()));
        }).toList();
        return new PageResponse<>(pageNo, pageSize, page.getTotalElements(), page.getTotalPages(), data);
    }

    private void attachChildren(VisitorsEntity visitor) {
        if (visitor.getVisitorChildren() == null) {
            return;
        }
        visitor.getVisitorChildren().forEach(child -> child.setVisitor(visitor));
    }

    private Specification<VisitorsEntity> visitorSpec(VisitorFilterInput filter) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(filter.visitorContact())) {
                predicates.add(cb.like(root.get("visitorContact"), like(filter.visitorContact()), '\\'));
            }
            if (StringUtils.hasText(filter.visitorName())) {
                predicates.add(cb.like(cb.lower(root.get("visitorName")), like(filter.visitorName().toLowerCase()), '\\'));
            }
            if (StringUtils.hasText(filter.visitorAddress())) {
                String address = like(filter.visitorAddress().toLowerCase());
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("visitorAddress").get("line1")), address, '\\'),
                        cb.like(cb.lower(root.get("visitorAddress").get("city")), address, '\\'),
                        cb.like(cb.lower(root.get("visitorAddress").get("pinCode")), address, '\\')
                ));
            }
            if (StringUtils.hasText(filter.visitorChildrenName())) {
                predicates.add(cb.like(cb.lower(root.join("visitorChildren").get("name")), like(filter.visitorChildrenName().toLowerCase()), '\\'));
            }
            return cb.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private Specification<VisitingRecordEntity> visitSpec(VisitFilterInput filter) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (filter.fromDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("visitedOn"), filter.fromDate().atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant()));
            }
            if (filter.toDate() != null) {
                predicates.add(cb.lessThan(root.get("visitedOn"), filter.toDate().plusDays(1).atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant()));
            }
            if (filter.status() != null) {
                predicates.add(cb.equal(root.get("status"), filter.status()));
            }
            if (StringUtils.hasText(filter.visitorHost())) {
                predicates.add(cb.like(cb.lower(root.get("visitorHost")), like(filter.visitorHost().toLowerCase()), '\\'));
            }
            if (StringUtils.hasText(filter.reason())) {
                predicates.add(cb.like(cb.lower(root.get("reason")), like(filter.reason().toLowerCase()), '\\'));
            }
            return cb.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private String normalizeVisitorSortBy(String sortBy) {
        return "_id".equals(sortBy) ? "id" : sortBy;
    }

    private String like(String value) {
        String escaped = value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
        return "%" + escaped + "%";
    }
}
