package com.suryansh.visitorentry.exception;

import lombok.Getter;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.http.HttpStatus;

@Getter
public class SpringVisitorException extends RuntimeException{
    private final ErrorType type;
    private final HttpStatus status;

    public SpringVisitorException(String exMessage, ErrorType type, HttpStatus status) {
        super(exMessage);
        this.type = type;
        this.status = status;
    }

}
