package com.suryansh.visitorentry.repository;

import com.suryansh.visitorentry.entity.VisitingRecordEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface VisitingRecordRepo extends JpaRepository<VisitingRecordEntity, String>, JpaSpecificationExecutor<VisitingRecordEntity> {
    Page<VisitingRecordEntity> findAllByVisitorId(String id, Pageable pageable);
}
