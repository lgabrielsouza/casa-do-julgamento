package br.org.casadojulgamento.exception;

import jakarta.persistence.OptimisticLockException;
import jakarta.servlet.http.HttpServletRequest;

import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.orm.ObjectOptimisticLockingFailureException;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;

import org.springframework.web.HttpRequestMethodNotSupportedException;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(
            ResourceNotFoundException exception,
            HttpServletRequest request
    ) {
        HttpStatus status = HttpStatus.NOT_FOUND;

        ApiError error = createError(
                status,
                "NOT_FOUND",
                exception.getMessage(),
                request.getRequestURI(),
                null
        );

        return ResponseEntity
                .status(status)
                .body(error);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiError> handleBusiness(
            BusinessException exception,
            HttpServletRequest request
    ) {
        HttpStatus status = HttpStatus.CONFLICT;

        ApiError error = createError(
                status,
                "CONFLICT",
                exception.getMessage(),
                request.getRequestURI(),
                null
        );

        return ResponseEntity
                .status(status)
                .body(error);
    }

    /*
     * =========================================================
     * CONCORRÊNCIA / OPTIMISTIC LOCK
     * =========================================================
     *
     * Entidades que utilizam @Version podem gerar conflito
     * quando duas requisições tentam alterar o mesmo registro
     * utilizando versões diferentes.
     *
     * Esse cenário é um conflito de estado, e não um erro
     * interno do servidor. Por isso retornamos HTTP 409.
     */
    @ExceptionHandler({
            ObjectOptimisticLockingFailureException.class,
            OptimisticLockException.class
    })
    public ResponseEntity<ApiError> handleOptimisticLock(
            Exception exception,
            HttpServletRequest request
    ) {
        log.warn(
                "Conflito de concorrência em {} {}: {}",
                request.getMethod(),
                request.getRequestURI(),
                exception.getMessage()
        );

        HttpStatus status = HttpStatus.CONFLICT;

        ApiError error = createError(
                status,
                "CONCURRENT_UPDATE",
                "Os dados foram alterados por outra operação. Atualize as informações e tente novamente.",
                request.getRequestURI(),
                null
        );

        return ResponseEntity
                .status(status)
                .body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        Map<String, String> validationErrors =
                new LinkedHashMap<>();

        exception
                .getBindingResult()
                .getFieldErrors()
                .forEach(fieldError ->
                        validationErrors.putIfAbsent(
                                fieldError.getField(),
                                fieldError.getDefaultMessage()
                        )
                );

        HttpStatus status =
                HttpStatus.BAD_REQUEST;

        ApiError error = createError(
                status,
                "VALIDATION_ERROR",
                "Existem campos inválidos na requisição.",
                request.getRequestURI(),
                validationErrors
        );

        return ResponseEntity
                .status(status)
                .body(error);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthenticationFailure(
            AuthenticationException exception,
            HttpServletRequest request
    ) {
        HttpStatus status =
                HttpStatus.UNAUTHORIZED;

        ApiError error = createError(
                status,
                "UNAUTHORIZED",
                "E-mail ou senha inválidos.",
                request.getRequestURI(),
                null
        );

        return ResponseEntity
                .status(status)
                .body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(
            AccessDeniedException exception,
            HttpServletRequest request
    ) {
        HttpStatus status =
                HttpStatus.FORBIDDEN;

        ApiError error = createError(
                status,
                "FORBIDDEN",
                "Você não possui permissão para realizar esta operação.",
                request.getRequestURI(),
                null
        );

        return ResponseEntity
                .status(status)
                .body(error);
    }

    @ExceptionHandler(
            HttpRequestMethodNotSupportedException.class
    )
    public ResponseEntity<ApiError> handleMethodNotAllowed(
            HttpRequestMethodNotSupportedException exception,
            HttpServletRequest request
    ) {
        HttpStatus status =
                HttpStatus.METHOD_NOT_ALLOWED;

        ApiError error = createError(
                status,
                "METHOD_NOT_ALLOWED",
                "Método HTTP não permitido para este endpoint.",
                request.getRequestURI(),
                null
        );

        return ResponseEntity
                .status(status)
                .body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpectedError(
            Exception exception,
            HttpServletRequest request
    ) {
        log.error(
                "Erro inesperado em {} {}",
                request.getMethod(),
                request.getRequestURI(),
                exception
        );

        HttpStatus status =
                HttpStatus.INTERNAL_SERVER_ERROR;

        ApiError error = createError(
                status,
                "INTERNAL_SERVER_ERROR",
                "Ocorreu um erro interno inesperado.",
                request.getRequestURI(),
                null
        );

        return ResponseEntity
                .status(status)
                .body(error);
    }

    private ApiError createError(
            HttpStatus status,
            String error,
            String message,
            String path,
            Map<String, String> validationErrors
    ) {
        return new ApiError(
                LocalDateTime.now(),
                status.value(),
                error,
                message,
                path,
                validationErrors
        );
    }
}