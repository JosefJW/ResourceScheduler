namespace ResourceScheduler.Models;

public class Reservation
{
    public long Id { get; set; }
    public long ItemId { get; set; }
    public Item Item { get; set; } = null!;
    public long FamilyId { get; set; }
    public Family Family { get; set; } = null!;
    public long UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTimeOffset StartTime { get; set; }
    public DateTimeOffset EndTime { get; set; }
}
