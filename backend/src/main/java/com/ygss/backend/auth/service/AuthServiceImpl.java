package com.ygss.backend.auth.service;

import com.ygss.backend.auth.dto.LoginRequestDto;
import com.ygss.backend.auth.dto.LoginResponseDto;
import com.ygss.backend.auth.dto.SignUpRequestDto;
import com.ygss.backend.global.jwt.utility.JwtTokenProvider;
import com.ygss.backend.global.security.config.SecurityConfig;
import com.ygss.backend.user.dto.UserAccountsDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ygss.backend.user.repository.UserAccountsRepository;
import com.ygss.backend.user.repository.UsersRepository;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UsersRepository usersRepsitory;
    private final UserAccountsRepository userAccountsRepository;
    private final SecurityConfig securityConfig;
    private final JwtTokenProvider jwtTokenProvider;
    /**
     * 회원 가입
     */
    @Override
    public Boolean signUp(SignUpRequestDto request) {
        try {
            usersRepsitory.insertUser(request.getName());
            userAccountsRepository.insertUserAccount(usersRepsitory.getLastUserIdx(),
                    request.getEmail(), cryptoPassword(request.getPassword()),
                    request.getWorkedAt(), request.getSalary(), request.getTotalRetirePension());
            return true;
        } catch (Exception e) {
            log.error("Sign Up Failed");
            throw new IllegalArgumentException("회원가입에 실패하였습니다.");
        }
    }
    /**
     * 로그인
     */
    @Override
    public LoginResponseDto login(LoginRequestDto request) {
        try {
            UserAccountsDto storedUser = getStoredUser(request.getEmail());
            if(!decryptoPassword(request.getPassword(), storedUser.getPassword())) throw new Exception();
            String storedUserName = usersRepsitory.getUserNameById(storedUser.getUserId());
            return LoginResponseDto.builder()
                    .accessToken(jwtTokenProvider.generateAccessToken(storedUser.getId(), storedUser.getEmail(), storedUserName))
                    .refreshToken(jwtTokenProvider.generateRefreshToken(storedUser.getId(), storedUser.getEmail(), storedUserName))
                    .build();
        } catch(Exception e) {
            log.warn("Login Failed");
            throw new IllegalArgumentException("로그인에 실패하였습니다.");
        }
    }

    /**
     * 비밀번호 암호화
     */
    private String cryptoPassword(String password) {
        return securityConfig.passwordEncoder().encode(password);
    }
    /**
     * 비밀번호 복호회
     */
    private Boolean decryptoPassword(String inputPassword, String originPassword) {
        return securityConfig.passwordEncoder().matches(inputPassword, originPassword);
    }
    private UserAccountsDto getStoredUser(String userEmail) {
        return userAccountsRepository.selectByUserEmail(userEmail);
    }
}
