package com.suryansh.visitorentry.security;

import com.suryansh.visitorentry.exception.SpringVisitorException;
import com.suryansh.visitorentry.service.interfaces.CacheService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserInfoService userService;
    private final CacheService cacheService;

    @Qualifier("handlerExceptionResolver")
    @Autowired
    private HandlerExceptionResolver resolver;

    public JwtAuthFilter(JwtService jwtService, UserInfoService userService, CacheService cacheService) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.cacheService = cacheService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = null;
        String userId = null;
        try{
            // Extract token from the Authorization header
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
                userId = jwtService.extractUserId(token);
            }
            if(authHeader != null && !authHeader.startsWith("Bearer ")){
                throw new SpringVisitorException("Please provide JWT Token 'Bearer <Your Token>' ",ErrorType.BAD_REQUEST,
                        HttpStatus.BAD_REQUEST);
            }

            // If token is present and not authenticated, validate it
            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                if (cacheService.isTokenInvalid(token)){
                    throw new ExpiredJwtException(null, null, "The token has been blacklisted or expired");
                }
                // Load user details from the user service
                UserDetails userDetails = userService.loadUserByUsername(userId);

                // If the token is valid, authenticate the user
                if (jwtService.validateToken(token, userDetails.getUsername())) {

                    // Create an authentication object and set it in the SecurityContext
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());

                    // Set authentication in the SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
            // Continue with the filter chain
            filterChain.doFilter(request, response);
        }catch (ExpiredJwtException e){
            resolver.resolveException(request, response, null, e);
        }
        catch (Exception e){
            System.out.println(e);
            resolver.resolveException(request, response, null, e);
        }

    }
}
