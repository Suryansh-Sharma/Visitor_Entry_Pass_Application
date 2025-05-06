package com.suryansh.visitorentry.security;

import com.suryansh.visitorentry.entity.UserDocument;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
//@ToString
public class UserPrincipal implements UserDetails {
    String id="";
    String password = "";
    Set<GrantedAuthority> authorities = new HashSet<>();
    Boolean isActive=false;
    Boolean isVerified=false;

    public UserPrincipal(UserDocument document){
        id = document.getId();
        password = document.getPassword();
        authorities.add(new SimpleGrantedAuthority("ROLE_"+document.getRole().name()));
        isActive = document.isActive();
        isVerified = document.isVerified();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return id;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive&&isVerified;
    }
}
