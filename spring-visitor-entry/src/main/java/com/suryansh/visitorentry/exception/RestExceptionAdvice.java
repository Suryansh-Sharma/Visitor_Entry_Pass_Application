package com.suryansh.visitorentry.exception;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class RestExceptionAdvice {
    @ExceptionHandler(SpringVisitorException.class)
    public ResponseEntity<ErrorDetail> handleShowNotFoundEx(SpringVisitorException ex) {
        ErrorDetail errorDetail = new ErrorDetail(LocalDateTime.now(),ex.getType(),ex.getMessage());
        return ResponseEntity.status(ex.getStatus()).body(errorDetail);
    }


    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorDetail> handlerForbiddenException(HttpServletRequest request,
                                                                 RuntimeException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new ErrorDetail(
                        LocalDateTime.now(),
                        ErrorType.FORBIDDEN,
                        "You have no permission to access this resource"
                ));
    }

    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<ErrorDetail> jwtExpired() {
        ErrorDetail errorDetail = new ErrorDetail(LocalDateTime.now(),ErrorType.FORBIDDEN
                ,"Your JWT token is expired");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorDetail);
    }

    public record ErrorDetail(LocalDateTime localDateTime, ErrorType errorType, String message) {
    }
}
