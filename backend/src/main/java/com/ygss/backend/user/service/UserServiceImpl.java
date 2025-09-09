package com.ygss.backend.user.service;

import com.ygss.backend.auth.service.AuthServiceImpl;
import com.ygss.backend.user.dto.EditUserInfoResponseDto;
import com.ygss.backend.user.repository.UserAccountsRepository;
import com.ygss.backend.user.repository.UsersRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService{
    private final AuthServiceImpl authService;
    private final UsersRepository usersRepository;
    private final UserAccountsRepository userAccountsRepository;
    @Override
    public String getUserNameById(Long userId) {
        return usersRepository.getUserNameById(userId);
    }

    @Override
    public Boolean validationPassword(String email, String password) {
        if(!authService.decryptoPassword(password, userAccountsRepository.getPasswordByUserEmail(email))) throw new IllegalArgumentException("Password Does Not Match");
        return true;
    }

    @Override
    public EditUserInfoResponseDto getUserInfoByUserEmail(String userEmail) {
        return usersRepository.getUserInfo(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User Not Found"));
    }

    /**
     * 회원정보 수정
     *  [변경불가]
     * - 이름은 변경할 수 없음
     * - 이메일은 변결할 수 없음
     *  [변경 가능]
     * - 비밀번호
     * - 근속연수
     * - 연봉
     * - 누적퇴직연금
     */
    @Override
    public Boolean updateUserInfo(EditUserInfoResponseDto request) {
        isEmptyPassword(request);
        if(userAccountsRepository.updateUserAccount(
                request.getEmail(),
                request.getPassword(),
                request.getWorkedAt(),
                request.getSalary(),
                request.getTotalRetirePension()
        ) < 1) throw new IllegalArgumentException("Not Found User");
        return true;
    }

    private void isEmptyPassword(EditUserInfoResponseDto request) {
        if(request.getPassword().isEmpty()) {
            request.setPassword(userAccountsRepository.getPasswordByUserEmail(request.getEmail()));
        } else {
            request.setPassword(authService.cryptoPassword(request.getPassword()));
        }
    }
}
