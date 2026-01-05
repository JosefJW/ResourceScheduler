namespace ResourceScheduler.Models;

public class User
{
    public long Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string PasswordSalt { get; set; } = "";
    public List<FamilyMembership> Memberships { get; set; } = [];
    public List<Reservation> Reservations { get; set; } = [];
}