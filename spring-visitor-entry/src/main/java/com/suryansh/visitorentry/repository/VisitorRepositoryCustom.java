package com.suryansh.visitorentry.repository;

import java.util.List;

public interface VisitorRepositoryCustom {
    List<String> findIdsByFilter(
            String visitorName,
            String visitorContact
    );
}
