package com.sos.controller;

import org.apache.catalina.connector.ClientAbortException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.servlet.http.HttpServletRequest;

@ControllerAdvice
public class ClientAbortExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(ClientAbortExceptionHandler.class);

    @ExceptionHandler(ClientAbortException.class)
    @ResponseBody
    public ResponseEntity<?> handleClientAbort(ClientAbortException ex, HttpServletRequest request) {
        logger.warn("Client disconnected during response: {} {}", request.getMethod(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
    }
}
