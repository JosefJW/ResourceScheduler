using Microsoft.EntityFrameworkCore;
using ResourceScheduler.Models;

namespace ResourceScheduler.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Family> Families => Set<Family>();
    public DbSet<FamilyMembership> FamilyMemberships => Set<FamilyMembership>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<Reservation> Reservations => Set<Reservation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FamilyMembership>()
            .HasKey(fm => new { fm.UserId, fm.FamilyId });

        modelBuilder.Entity<Reservation>()
            .HasCheckConstraint("ck_reservation_time", "\"StartTime\" < \"EndTime\"");
    }
}
