package com.parkpulse.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class StartupRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(StartupRunner.class);

    @Override
    public void run(String... args) {
        String banner = """
                
        ╔═══════════════════════════════════════════════════════════════════════════════╗
        ║                                                                              ║
        ║   ██████╗ ███████╗██╗   ██╗████████╗ ██████╗ ███╗   ██╗███████╗             ║
        ║   ██╔══██╗██╔════╝██║   ██║╚══██╔══╝██╔═══██╗████╗  ██║██╔════╝             ║
        ║   ██████╔╝█████╗  ██║   ██║   ██║   ██║   ██║██╔██╗ ██║█████╗               ║
        ║   ██╔══██╗██╔══╝  ██║   ██║   ██║   ██║   ██║██║╚██╗██║██╔══╝               ║
        ║   ██║  ██║███████╗╚██████╔╝   ██║   ╚██████╔╝██║ ╚████║███████╗             ║
        ║   ╚═╝  ╚═╝╚══════╝ ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚══════╝             ║
        ║                                                                              ║
        ║   ParkPulse Backend Started Successfully!                                    ║
        ║                                                                              ║
        ╠═══════════════════════════════════════════════════════════════════════════════╣
        ║                                                                              ║
        ║   🔐 DEFAULT ADMIN CREDENTIALS                                               ║
        ║   ┌────────────────────────────────────────────────────────────────────────┐ ║
        ║   │  Username: admin                                                         │ ║
        ║   │  Password: admin123                                                      │ ║
        ║   └────────────────────────────────────────────────────────────────────────┘ ║
        ║                                                                              ║
        ║   🌐 API Base URL: http://localhost:8080/api                                 ║
        ║   📚 H2 Console:   http://localhost:8080/h2-console                          ║
        ║                                                                              ║
        ║   ⚠️  Please change the default password after first login!                  ║
        ║                                                                              ║
        ╚═══════════════════════════════════════════════════════════════════════════════╝
        """;

        log.info("\n{}", banner);
    }
}