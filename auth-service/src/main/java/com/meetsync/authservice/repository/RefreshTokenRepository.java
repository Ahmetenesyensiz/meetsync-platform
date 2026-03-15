package com.meetsync.authservice.repository;

import com.meetsync.authservice.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUser(com.meetsync.authservice.model.User user);
}
