package com.suryansh.visitorentry.repository;

import com.suryansh.visitorentry.entity.VisitingRecordDoc;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface VisitingRecordRepo extends MongoRepository<VisitingRecordDoc, String> {
    Page<VisitingRecordDoc> findAllByVisitorId(String id, Pageable pageable);
}
