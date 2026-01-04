namespace ResourceScheduler.Models;

public class Reservation
{
    public long Id { get; set; }
    public long ItemId { get; set; }
    public long UserId { get; set; }
    public DateTimeOffset StartTime { get; set; }
    public DateTimeOffset EndTime { get; set; }
}
