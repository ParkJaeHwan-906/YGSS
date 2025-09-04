package com.ygss.backend.auth.service;

import com.ygss.backend.auth.dto.LoginRequestDto;
import com.ygss.backend.auth.dto.LoginResponseDto;
import com.ygss.backend.auth.dto.SignUpRequestDto;

public interface AuthService {
    Boolean signUp(SignUpRequestDto request);
    LoginResponseDto login(LoginRequestDto request);
}
