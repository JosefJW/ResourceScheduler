namespace ResourceScheduler.Models;

public class FamilyMembership
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public User User { get; set; } = null!;
    public long FamilyId { get; set; }
    public Family Family { get; set; } = null!;
    public string Role { get; set; } = "member";
}
