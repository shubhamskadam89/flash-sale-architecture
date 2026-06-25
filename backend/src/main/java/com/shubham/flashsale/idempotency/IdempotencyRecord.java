package com.shubham.flashsale.idempotency;

import lombok.*;
import org.springframework.http.HttpStatus;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class IdempotencyRecord {

    private IdempotencyState state;


    private String responseBody;

    private int status;


}