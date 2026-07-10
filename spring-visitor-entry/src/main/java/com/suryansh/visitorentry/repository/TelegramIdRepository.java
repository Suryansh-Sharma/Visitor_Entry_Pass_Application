package com.suryansh.visitorentry.repository;

import com.suryansh.visitorentry.entity.TelegramIdEntity;
import com.suryansh.visitorentry.entity.UsersEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TelegramIdRepository extends JpaRepository<TelegramIdEntity,String> {
    List<TelegramIdEntity> findAllByRole(UsersEntity.ROLE role);

    @Query("select t from TelegramIdEntity t")
    List<TelegramIdEntity> getAllTelegramIds();
}
