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
}
