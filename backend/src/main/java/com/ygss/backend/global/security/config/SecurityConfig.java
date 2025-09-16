package com.ygss.backend.global.security.config;

import com.ygss.backend.global.jwt.filter.JWTVerificationFilter;
import com.ygss.backend.global.jwt.filter.SecurityExceptionHandlingFilter;
import com.ygss.backend.global.jwt.utility.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtTokenProvider jwtTokenProvider;
    private final JWTVerificationFilter jwtVerificationFilter;
    private final SecurityExceptionHandlingFilter securityExceptionHandlingFilter;
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF 비활성화 (JWT 사용시 불필요)
                .csrf(csrf -> csrf.disable())

                // 폼 로그인 비활성화
                .formLogin(form -> form.disable())

                // 세션 정책: STATELESS (JWT 사용시)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        //인증 없이 허용할 엔드포인트들
//                        .requestMatchers("/**").permitAll()
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/infra/**").permitAll()
                        .requestMatchers("/market/**").permitAll()
                        .requestMatchers("/product/**").permitAll()
                        .requestMatchers("/investor/personality/list").permitAll()
                        .requestMatchers("/recommend/public/**").permitAll()
                        .requestMatchers("/chatbot/term/list").permitAll()
                        .requestMatchers("/swagger-ui/**", "/api-docs/**", "/swagger-ui.html").permitAll()
                        //비허용 엔드포인트
                        .anyRequest().authenticated()
                )
//                .httpBasic(Customizer.withDefaults())
                // JWT 필터들을 필터 체인에 추가
                // 순서: SecurityExceptionHandlingFilter -> JWTVerificationFilter
                .addFilterBefore(securityExceptionHandlingFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtVerificationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
