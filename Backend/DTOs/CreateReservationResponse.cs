namespace ResourceScheduler.Dtos;

public record CreateReservationResponse(
	long Id,
	long ItemId,
	string ItemName,
	long FamilyId,
	long UserId,
	DateTimeOffset StartTime,
	DateTimeOffset EndTime
);