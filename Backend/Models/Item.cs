namespace ResourceScheduler.Models;

public class Item
{
    public long Id { get; set; }
    public long FamilyId { get; set; }
    public Family Family { get; set; } = null!;
    public string Name { get; set; } = "";
    public string Type { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public List<Reservation> Reservations { get; set; } = [];
}
