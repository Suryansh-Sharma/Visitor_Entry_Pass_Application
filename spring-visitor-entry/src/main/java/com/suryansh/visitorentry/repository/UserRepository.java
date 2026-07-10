package com.suryansh.visitorentry.repository;

import com.suryansh.visitorentry.entity.UsersEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * This is a repository interface that communicated with a database layer
 * This is used for UserDocument.
 * @author suryansh
 */
@Repository
public interface UserRepository extends JpaRepository<UsersEntity,String> {
    Optional<UsersEntity> findByUsername(String username);

    Optional<UsersEntity> findByRefreshTokenToken(String refreshToken);

    Optional<UsersEntity> findByForgetPasswordUuid(String uuid);

    long countByRole(UsersEntity.ROLE role);
}
