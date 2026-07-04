package com.shubham.flashsale.ratelimit.config;

import com.shubham.flashsale.ratelimit.resolver.policy.RateLimitPolicy;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "ratelimit")
public class RateLimitProperties {

    private Map<RateLimitPolicy, PolicyConfiguration> policies =
            new EnumMap<>(RateLimitPolicy.class);

}