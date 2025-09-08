package com.ygss.backend.common.response;


import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum SuccessCode {
    //200 OK
    SUCCESS(200,HttpStatus.OK, "API 요청 성공"),
    LOGIN_SUCCESS(200,HttpStatus.OK,"로그인 되었습니다."),

    //201 CREATED
    SIGNUP_SUCCESS(201,HttpStatus.CREATED,"회원가입 되었습니다."),
    ;


    private final int code;
    private final HttpStatus httpStatus;
    private final String message;
}
