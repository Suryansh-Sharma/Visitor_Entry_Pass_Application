package com.suryansh.visitorentry.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class VisitorRepositoryImpl implements VisitorRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<String> findIdsByFilter(String visitorName, String visitorContact) {
        StringBuilder jpql = new StringBuilder("select v.id from VisitorsEntity v where 1 = 1");
        Map<String, String> parameters = new HashMap<>();
        if (StringUtils.hasText(visitorName)) {
            jpql.append(" and lower(v.visitorName) like lower(:visitorName) escape '\\'");
            parameters.put("visitorName", "%" + escapeLike(visitorName) + "%");
        }
        if (StringUtils.hasText(visitorContact)) {
            jpql.append(" and v.visitorContact like :visitorContact escape '\\'");
            parameters.put("visitorContact", "%" + escapeLike(visitorContact) + "%");
        }
        TypedQuery<String> query = entityManager.createQuery(jpql.toString(), String.class);
        parameters.forEach(query::setParameter);
        return query.getResultList();
    }

    private String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
