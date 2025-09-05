package com.ygss.backend.user.service;

import com.ygss.backend.user.repository.UsersRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService{

    private final UsersRepository usersRepository;
    @Override
    public String getUserNameById(Long userId) {
        return usersRepository.getUserNameById(userId);
    }
}
