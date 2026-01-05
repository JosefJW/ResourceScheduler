namespace ResourceScheduler.Dtos;

public record PasswordUpdate(
    string CurrentPassword,
    string NewPassword
);