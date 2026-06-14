package com.suryansh.visitorentry.repository;

import com.suryansh.visitorentry.entity.VisitorDoc;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * This is a repository interface that communicated with a database layer
 * This is used for VisitorDoc.
 * @author suryansh
 */
public interface VisitRepository extends MongoRepository<VisitorDoc,String> {
    
    Optional<VisitorDoc> findByVisitorContact(String visitorContact);

}
