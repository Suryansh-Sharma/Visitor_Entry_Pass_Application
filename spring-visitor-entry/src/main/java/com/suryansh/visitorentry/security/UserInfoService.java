package com.suryansh.visitorentry.security;

import com.suryansh.visitorentry.entity.UserDocument;
import com.suryansh.visitorentry.service.interfaces.CacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserInfoService implements UserDetailsService {
    @Autowired
    private CacheService cacheService;

    public UserInfoService(){

    }

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        UserDocument document = cacheService.FetchUser(userId);
        return new UserPrincipal(document);
    }


}
