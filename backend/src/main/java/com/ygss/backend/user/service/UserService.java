package com.ygss.backend.user.service;

public interface UserService {
    String getUserNameById(Long userId);
    Boolean validationPassword(String email, String password);
}
