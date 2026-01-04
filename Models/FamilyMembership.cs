namespace ResourceScheduler.Models;

public class FamilyMembership
{
    public long UserId { get; set; }
    public long FamilyId { get; set; }
    public string Role { get; set; } = "member";
}
