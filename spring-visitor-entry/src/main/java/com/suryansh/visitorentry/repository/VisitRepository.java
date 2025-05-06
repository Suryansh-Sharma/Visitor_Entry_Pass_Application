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
    /**
     * This method is used to find a visitor on a specific date.
     * This method is also used for finding today's visit.
     *
     * @param pageable It accepts a Pageable object.
     * @return It will return a page of visitor document.
     */
    @Query(value = "{'visitingRecords': { $elemMatch: { 'visitingDateTime': { $gte: ?0, $lt: ?1 } } }}",fields = "{'visitingRecords':0}")
    Page<VisitorDoc> findVisitBySpecificDate(LocalDateTime startOfDay, LocalDateTime endOfDay, Pageable pageable);

    Optional<VisitorDoc> findByVisitorContact(String visitorContact);

}
