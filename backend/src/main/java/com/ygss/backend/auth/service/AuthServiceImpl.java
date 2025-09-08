package com.ygss.backend.auth.service;

import com.ygss.backend.auth.dto.CheckEmailRequestDto;
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
    private final String[] banKeywords = {"test", "admin", "master"};    // 이메일에 포함되면 안되는 키워드

    private final UsersRepository usersRepsitory;
    private final UserAccountsRepository userAccountsRepository;
    private final SecurityConfig securityConfig;
    private final JwtTokenProvider jwtTokenProvider;
    /**
     * 아이디 중복 확인
     */
    @Override
    public Boolean checkEmail(CheckEmailRequestDto request) {
        try {
            String lowerCaseEmail = request.getEmail().toLowerCase();
            for(String banKeyword : banKeywords) {
                if(lowerCaseEmail.contains(banKeyword)) throw new IllegalArgumentException("사용할 수 없는 이메일 입니다.");
            }
            if(userAccountsRepository.selectByUserEmail(request.getEmail()) != null) throw new IllegalArgumentException("이미 존재하는 이메일 입니다.");
            return true;
        } catch (IllegalArgumentException e) {
            log.warn("Invalid Email : {}",e.getMessage());
            throw new IllegalArgumentException(e.getMessage());
        } catch (Exception e) {
            log.error("UnExpected Error : {}", e.getMessage());
            throw new IllegalArgumentException("예상치 못한 오류가 발생하였습니다.");
        }
    }
    /**
     * 회원 가입
     */
    @Override
    public Boolean signUp(SignUpRequestDto request) {
        try {
            checkEmail(CheckEmailRequestDto.builder().email(request.getEmail()).build());
            usersRepsitory.insertUser(request.getName());
            userAccountsRepository.insertUserAccount(usersRepsitory.getLastUserIdx(),
                    request.getEmail(), cryptoPassword(request.getPassword()),
                    request.getWorkedAt(), request.getSalary(), request.getTotalRetirePension());
            return true;
        } catch (Exception e) {
            log.error("Sign Up Failed : {}", e.getMessage());
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
