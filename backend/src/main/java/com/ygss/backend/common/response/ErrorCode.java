package com.ygss.backend.common.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;


@Getter
@AllArgsConstructor
public enum ErrorCode {
    //400 BAD REQUEST
    BAD_REQUEST(400, HttpStatus.BAD_REQUEST, "잘못된 접근입니다."),
    BAD_LOGIN(400, HttpStatus.BAD_REQUEST, "올바르지 않은 로그인 정보입니다."),

    //401 Unauthorized
    UNAUTHORIZED(401,HttpStatus.UNAUTHORIZED, "로그인 후 사용해주세요"),
    //404 NOT FOUND
    NOT_FOUND(404, HttpStatus.NOT_FOUND, "해당 API를 찾을 수 없습니다."),

    //405 METHOD NOT ALLOWED
    METHOD_NOT_ALLOWED(405, HttpStatus.METHOD_NOT_ALLOWED, "지원하지 않는 메소드입니다."),

    //429 TOO MANY REQUESTS
    TOO_MANY_REQUESTS(429, HttpStatus.TOO_MANY_REQUESTS, "요청 횟수를 초과하였습니다."),

    //500 INTERNAL SERVER ERROR
    INTERNAL_SERVER_ERROR(500, HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류입니다.");


    private final int code;
    private final HttpStatus httpStatus;
    private final String message;
}
