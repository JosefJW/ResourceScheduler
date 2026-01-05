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
    public DbSet<FamilyInvitation> FamilyInvitations => Set<FamilyInvitation>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<Reservation> Reservations => Set<Reservation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FamilyMembership>()
            .HasKey(fm => new { fm.UserId, fm.FamilyId });

        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.ToTable(tb => tb.HasCheckConstraint("ck_reservation_time", "\"StartTime\" < \"EndTime\""));

            entity.HasOne(r => r.Item)
                .WithMany(i => i.Reservations)
                .HasForeignKey(r => r.ItemId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.User)
                .WithMany(u => u.Reservations)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FamilyMembership>()
            .HasOne(fm => fm.Family)
            .WithMany(f => f.Memberships)
            .HasForeignKey(fm => fm.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FamilyMembership>()
            .HasOne(fm => fm.User)
            .WithMany(u => u.Memberships)
            .HasForeignKey(fm => fm.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FamilyInvitation>(entity =>
        {
            entity.HasKey(fi => fi.Id);

            entity.HasOne(fi => fi.Family)
                .WithMany()
                .HasForeignKey(fi => fi.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(fi => fi.InvitedUser)
                .WithMany()
                .HasForeignKey(fi => fi.InvitedUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(fi => fi.InviterUser)
                .WithMany()
                .HasForeignKey(fi => fi.InviterUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(fi => new { fi.FamilyId, fi.InvitedUserId })
                .IsUnique();
        });

    }
}
