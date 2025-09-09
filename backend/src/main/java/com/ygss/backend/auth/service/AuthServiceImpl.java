package com.ygss.backend.auth.service;

import com.ygss.backend.auth.dto.*;
import com.ygss.backend.auth.repository.UserRefreshTokenRepository;
import com.ygss.backend.global.jwt.utility.JwtTokenProvider;
import com.ygss.backend.global.security.config.SecurityConfig;
import com.ygss.backend.user.dto.UserAccountsDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ygss.backend.user.repository.UserAccountsRepository;
import com.ygss.backend.user.repository.UsersRepository;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final String[] banKeywords = {"test", "admin", "master"};    // 이메일에 포함되면 안되는 키워드
    private final String passwordRegex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[$@$!%*?&])[A-Za-z\\d$@$!%*?&]{8,}$";
    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExp;
    private final UsersRepository usersRepsitory;
    private final UserAccountsRepository userAccountsRepository;
    private final UserRefreshTokenRepository userRefreshTokenRepository;
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
                if(lowerCaseEmail.contains(banKeyword)) throw new IllegalArgumentException("Invalid Email");
            }
            userAccountsRepository.selectByUserEmail(request.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("Already Exist Email"));
            return true;
        } catch (IllegalArgumentException e) {
            log.warn("Invalid Email : {}",e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("UnExpected Error : {}", e.getMessage());
            return false;
        }
    }

    /**
     * 비밀번호 유효성 검사
     */
    @Override
    public Boolean isValidPassword(CheckPasswordRequest request) {
        try {
            Pattern avoidPattern = Pattern.compile(passwordRegex);
            Matcher matcher = avoidPattern.matcher(request.getPassword());
            if(!matcher.matches()) throw new IllegalArgumentException("Invalid Password");
            return true;
        } catch (IllegalArgumentException e) {
            log.warn("isValidPassword Failed : {}", e.getMessage());
            throw e;
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
            if(!decryptoPassword(request.getPassword(), storedUser.getPassword())) throw new IllegalArgumentException("Password Not Matched");

            userRefreshTokenRepository.deleteFromUserId(storedUser.getUserId());

            String storedUserName = usersRepsitory.getUserNameById(storedUser.getUserId());
            String accessToken = jwtTokenProvider.generateAccessToken(storedUser.getId(), storedUser.getEmail(), storedUserName);
            String refreshToken = jwtTokenProvider.generateRefreshToken(storedUser.getId(), storedUser.getEmail(), storedUserName);
            System.out.println(storedUser);
            userRefreshTokenRepository.insertUserRefreshToken(
                    storedUser.getUserId(),
                    refreshToken,
                    LocalDateTime.now().plus(Duration.ofMillis(refreshTokenExp)));

            return LoginResponseDto.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .build();
        } catch(Exception e) {
            log.warn("Login Failed");
            throw new IllegalArgumentException(e.getMessage());
        }
    }
    /**
     * RefreshToken 검증
     */
    public Boolean isValidRefreshToken(Long userId) {
        String userRefreshToken = userRefreshTokenRepository.findByuserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Refresh Token Not Found"));

        if(!jwtTokenProvider.validateToken(userRefreshToken)) {
            userRefreshTokenRepository.deleteFromUserId(userId);
            throw new IllegalArgumentException("Invalid Refresh Token");
        }
        return true;
    }
    /**
     * DB 에 RefreshToken 업데이트
     */
    public LoginResponseDto updateUserRefreshToken(Long userId) {
        UserAccountsDto userAccount = userAccountsRepository.selectByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User Not Found"));
        String userName = usersRepsitory.getUserNameById(userId);
        String accessToken = jwtTokenProvider.generateAccessToken(userId, userAccount.getEmail(), userName);
        String refreshToken = jwtTokenProvider.generateAccessToken(userId, userAccount.getEmail(), userName);

        userRefreshTokenRepository.updateRefreshToken(
                userId,
                refreshToken,
                LocalDateTime.now().plus(Duration.ofMillis(refreshTokenExp)));

        return LoginResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }
    public LoginResponseDto regenerateAccessToken(String email) {
        Long userId = userAccountsRepository.selectUserIdByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User Not Found"));
        isValidRefreshToken(userId);
        return updateUserRefreshToken(userId);
    }
    /**
     * 비밀번호 암호화
     */
    public String cryptoPassword(String password) {
        return securityConfig.passwordEncoder().encode(password);
    }
    /**
     * 비밀번호 복호화
     */
    public Boolean decryptoPassword(String inputPassword, String originPassword) {
        return securityConfig.passwordEncoder().matches(inputPassword, originPassword);
    }
    private UserAccountsDto getStoredUser(String userEmail) {
        return userAccountsRepository.selectByUserEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User Not Found"));
    }
}
