namespace ResourceScheduler.Dtos;

public record CreateReservation(
    long ItemId,
	DateTimeOffset StartTime,
	DateTimeOffset EndTime
);