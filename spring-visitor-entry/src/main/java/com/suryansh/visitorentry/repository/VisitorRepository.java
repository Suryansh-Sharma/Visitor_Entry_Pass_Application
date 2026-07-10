package com.suryansh.visitorentry.repository;

import com.suryansh.visitorentry.entity.VisitorsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

/**
 * This is a repository interface that communicated with a database layer
 * This is used for VisitorEntity.
 * @author suryansh
 */
public interface VisitorRepository extends JpaRepository<VisitorsEntity,String>, JpaSpecificationExecutor<VisitorsEntity>, VisitorRepositoryCustom {

    Optional<VisitorsEntity> findByVisitorContact(String visitorContact);
}
