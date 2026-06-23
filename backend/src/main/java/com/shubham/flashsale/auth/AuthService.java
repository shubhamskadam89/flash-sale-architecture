package com.shubham.flashsale.auth;


import com.shubham.flashsale.auth.dto.AuthResponse;
import com.shubham.flashsale.auth.jwt.JwtProperties;
import com.shubham.flashsale.auth.jwt.JwtService;
import com.shubham.flashsale.exception.UserAlreadyExistsException;
import com.shubham.flashsale.user.dto.LoginDto;
import com.shubham.flashsale.user.dto.UserResponseDto;
import com.shubham.flashsale.user.entity.RegistrartionDto;
import com.shubham.flashsale.user.entity.User;
import com.shubham.flashsale.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private  final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;


    public UserResponseDto registerUser(RegistrartionDto registrartionDto) {
        log.info("USER REGISTRATION REQUEST FETCHED");
        if(userRepository.existsByEmail(registrartionDto.email())){
            log.debug( "USER WITH {} EMAIL EXIST",registrartionDto.email());
            throw new UserAlreadyExistsException(registrartionDto.email());
        }
        log.info("ALL CHECKS PASSED FOR REGISTRATION");
        User user = User.builder()
                .email(registrartionDto.email())
                .fullName(registrartionDto.fullName())
                .passwordHash(passwordEncoder.encode(registrartionDto.password()))
                .role(registrartionDto.role())
                .isActive(true) // later verify using otp on mail
                .build();

        userRepository.save(user);
        log.warn("{} SAVED TO DATABASE",user.getFullName());

        return new UserResponseDto(user.getUuid(),
                user.getEmail(),
                user.getRole(),
                user.getIsActive()
        );

    }

    public AuthResponse loginUser(LoginDto loginDto){
        log.info("USER LOGIN REQUEST FETCHED");
        if(!userRepository.existsByEmail(loginDto.email())){
            log.debug( "USER WITH {} EMAIL DOES NOT EXIST",loginDto.email());
            throw new NoSuchElementException(loginDto.email());
        }
        log.info("ALL CHECKS PASSED FOR LOGIN");

        //issue jwt token and all
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDto.email(),loginDto.password()
                )
        );

        String token = jwtService.generateToken((UserDetails) authentication.getPrincipal());
        return new AuthResponse(token, "Bearer", jwtProperties.getExpiration()/1000);

    }



}