package com.suryansh.visitorentry.repository;

import com.suryansh.visitorentry.entity.VisitorDoc;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.regex.Pattern;

@Repository
public class VisitorRepositoryImpl implements VisitorRepositoryCustom {

    private final MongoTemplate mongoTemplate;
    public VisitorRepositoryImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public List<String> findIdsByFilter(String visitorName, String visitorContact) {
        Query query = new Query();

        List<Criteria> criteria = new ArrayList<>();

        if (StringUtils.hasText(visitorName)) {

            criteria.add(
                    Criteria.where("visitorName")
                            .regex(Pattern.quote(visitorName), "i")
            );
        }

        if (StringUtils.hasText(visitorContact)) {

            criteria.add(
                    Criteria.where("visitorContact")
                            .regex(Pattern.quote(visitorContact))
            );
        }
        if (criteria.size() == 1) {

            query.addCriteria(criteria.getFirst());

        } else if (!criteria.isEmpty()) {

            query.addCriteria(
                    new Criteria().andOperator(
                            criteria.toArray(new Criteria[0])
                    )
            );
        }
        query.fields().include("_id");

        return mongoTemplate.find(query, VisitorDoc.class)
                .stream()
                .map(VisitorDoc::getId)
                .toList();
    }
}