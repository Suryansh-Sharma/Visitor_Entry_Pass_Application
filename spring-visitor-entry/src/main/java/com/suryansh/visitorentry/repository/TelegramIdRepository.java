package com.suryansh.visitorentry.repository;

import com.suryansh.visitorentry.entity.TelegramIdDocument;
import com.suryansh.visitorentry.entity.UserDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TelegramIdRepository extends MongoRepository<TelegramIdDocument,String> {
    List<TelegramIdDocument> findAllByRole(UserDocument.ROLE role);
}
