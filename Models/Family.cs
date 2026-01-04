namespace ResourceScheduler.Models;

public class Family
{
    public long Id { get; set; }
    public string Name { get; set; } = "";
    public List<FamilyMembership> Memberships { get; set; } = [];
    public List<Reservation> Reservations { get; set; } = [];
}