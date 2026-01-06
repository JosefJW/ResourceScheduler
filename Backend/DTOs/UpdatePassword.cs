namespace ResourceScheduler.Dtos;

public record UpdatePassword(
	string OldPassword,
	string NewPassword
);