namespace ResourceScheduler.Dtos;

public record SignupRequest(
    string Username,
    string Email,
    string Password
);