package br.org.casadojulgamento.integration.sympla.exception;

public class SymplaApiException
        extends RuntimeException {

    private final int statusCode;

    public SymplaApiException(
            String message,
            int statusCode
    ) {
        super(message);
        this.statusCode = statusCode;
    }

    public SymplaApiException(
            String message,
            int statusCode,
            Throwable cause
    ) {
        super(message, cause);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}