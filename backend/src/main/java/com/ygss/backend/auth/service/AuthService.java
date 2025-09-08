package com.ygss.backend.auth.service;

import com.ygss.backend.auth.dto.*;

public interface AuthService {
    Boolean signUp(SignUpRequestDto request);
    LoginResponseDto login(LoginRequestDto request);
    Boolean checkEmail(CheckEmailRequestDto request);
    Boolean isValidPassword(CheckPasswordRequest request);
}
