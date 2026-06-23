package com.shubham.flashsale.auth;

import com.shubham.flashsale.auth.dto.AuthResponse;
import com.shubham.flashsale.user.dto.LoginDto;
import com.shubham.flashsale.user.dto.UserResponseDto;
import com.shubham.flashsale.user.entity.RegistrartionDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    //POST
    @PostMapping("/v1/register")
    ResponseEntity<UserResponseDto> registerUser(@RequestBody RegistrartionDto registrartionDto){
        return ResponseEntity.ok(authService.registerUser(registrartionDto));
    }
    //POST
    @PostMapping("/v1/login")
    ResponseEntity<AuthResponse> loginUser(@RequestBody LoginDto loginDto){
        return  ResponseEntity.ok(authService.loginUser(loginDto));
    }

}