namespace ResourceScheduler.Models;

public class FamilyInvitation
{
    public long Id { get; set; }
    public long FamilyId { get; set; }
    public long InvitedUserId { get; set; }
	public User InvitedUser { get; set; } = null!;
    public long InviterUserId { get; set; } // the owner who sent it
	public User InviterUser { get; set; } = null!;
    public bool Accepted { get; set; } = false;
	public bool Responded { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
	public DateTime? RespondedAt { get; set; }
    public Family Family { get; set; } = null!;
}
