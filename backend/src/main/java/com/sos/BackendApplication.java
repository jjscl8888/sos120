package com.sos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import com.sos.server.ServerMain;

@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        new Thread(() -> {
            try {
                ServerMain.start();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                e.printStackTrace();
            }
        }).start();
        SpringApplication.run(BackendApplication.class, args);
    }
}