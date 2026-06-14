package com.suryansh.visitorentry.repository;

import com.suryansh.visitorentry.entity.VisitorDoc;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

/**
 * This is a repository interface that communicated with a database layer
 * This is used for VisitorDoc.
 * @author suryansh
 */
public interface VisitorRepository extends MongoRepository<VisitorDoc,String>, VisitorRepositoryCustom {

    Optional<VisitorDoc> findByVisitorContact(String visitorContact);
}
