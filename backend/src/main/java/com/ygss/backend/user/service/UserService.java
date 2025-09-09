package com.ygss.backend.user.service;

import com.ygss.backend.user.dto.EditUserInfoResponseDto;

public interface UserService {
    String getUserNameById(Long userId);
    Boolean validationPassword(String email, String password);
    EditUserInfoResponseDto getUserInfoByUserEmail(String userEmail);
}
