package com.suryansh.visitorentry.exception;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import graphql.schema.DataFetchingEnvironment;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.constraints.NotNull;
import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
public class CustomExceptionResolver extends DataFetcherExceptionResolverAdapter {
    @Override
    protected GraphQLError resolveToSingleError(@NotNull Throwable ex,@NotNull DataFetchingEnvironment env) {
        if (ex instanceof SpringVisitorException ) {
            return GraphqlErrorBuilder.newError()
                    .errorType(((SpringVisitorException) ex).getType())
                    .message(ex.getMessage())
                    .path(env.getExecutionStepInfo().getPath())
                    .build();
        } else if (ex instanceof ConstraintViolationException constraintViolationException) {
            Set<ConstraintViolation<?>> constraintViolations = constraintViolationException.getConstraintViolations();

            List<String> violationMessages = new ArrayList<>();
            for (ConstraintViolation<?> violation : constraintViolations) {
                String violationMessage = violation.getMessage();
                violationMessages.add(violationMessage);
            }

            return GraphqlErrorBuilder.newError()
                    .errorType(ErrorType.BAD_REQUEST)
                    .message(violationMessages.toString())
                    .path(env.getExecutionStepInfo().getPath())
                    .build();
        } else {
            return null;
        }
    }

    private ErrorType mapSpringVisitorErrorType(SpringVisitorException ex) {
        // Map SpringVisitorException's type to ErrorType
        return switch (ex.getType().toString()) {
            case "NOT_FOUND" -> ErrorType.NOT_FOUND;
            case "FORBIDDEN" -> ErrorType.FORBIDDEN;
            case "BAD_REQUEST" -> ErrorType.BAD_REQUEST;
            default -> ErrorType.INTERNAL_ERROR;
        };
    }

}
