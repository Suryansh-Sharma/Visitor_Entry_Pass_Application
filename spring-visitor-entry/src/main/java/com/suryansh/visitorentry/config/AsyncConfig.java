package com.suryansh.visitorentry.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.security.task.DelegatingSecurityContextAsyncTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
public class AsyncConfig implements AsyncConfigurer {

    @Override
    @Bean(name = "taskExecutor")
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("async-");
        executor.initialize();
        // Plain @Async dispatch runs the method body on a pooled worker thread,
        // which does NOT inherit the calling request's SecurityContext by default
        // (SecurityContextHolder is thread-local). Any @Async method that also
        // relies on @PreAuthorize/SecurityContextHolder (e.g. addNewTelegramId,
        // deleteTelegramId) would otherwise always see an unauthenticated
        // context and fail authorization, regardless of the caller's real JWT.
        // This wrapper captures the SecurityContext at submission time and makes
        // it available on the worker thread for the duration of the task.
        return new DelegatingSecurityContextAsyncTaskExecutor(executor);
    }
}
