using Microsoft.EntityFrameworkCore;
using ResourceScheduler.Data;
using ResourceScheduler.Models;

namespace ResourceScheduler.Endpoints;

public static class FamilyEndpoints
{
	public static void MapFamilyEndpoints(this WebApplication app)
	{
		// Post
		// Add a family to the database
		app.MapPost("/families", async (Family family, AppDbContext db) =>
		{
			db.Families.Add(family);
			await db.SaveChangesAsync();
			return Results.Created($"families/{family.Id}", family);
		});

		// Get
		// Get a list of all families
		app.MapGet("/families", async (AppDbContext db) => 
			await db.Families.ToListAsync());

		// Get id
		// Get a family by id
		app.MapGet("/families/{id}", async (long id, AppDbContext db) =>
			await db.Families.FindAsync(id) is Family family ? Results.Ok(family) : Results.NotFound());

		// Post
		// Add a user to the family
		app.MapPost("/families/{familyId}/users", async (long familyId, FamilyMembership membership, AppDbContext db) =>
		{
			// Check for duplicates
			var exists = await db.FamilyMemberships
				.AnyAsync(f => f.FamilyId == familyId && f.UserId == membership.UserId);
			if (exists) return Results.Conflict("User is already in the family.");

			membership.FamilyId = familyId;

			// Default to member role, not owner
			var allowedRoles = new[] { "member", "owner" };
			membership.Role = membership.Role?.ToLower();
			if (string.IsNullOrWhiteSpace(membership.Role) || !allowedRoles.Contains(membership.Role))
				membership.Role = "member";

			db.FamilyMemberships.Add(membership);
			await db.SaveChangesAsync();
			return Results.Created($"families/{familyId}/users/{membership.Id}", membership);
		});

		// Delete
		// Delete the family with the specified id
		app.MapDelete("/families/{id}", async(long id, AppDbContext db) =>
		{
			var deleteFamily = await db.Families.FirstOrDefaultAsync(family => family.Id == id);

			if (deleteFamily != null)
			{
				db.Families.Remove(deleteFamily);
				await db.SaveChangesAsync();
				return Results.Ok(deleteFamily);
			}
			else
			{
				return Results.NotFound();
			}
		});

		// Delete
		// Delete a user from a family
		app.MapDelete("/families/{familyId}/users/{userId}", async (long familyId, long userId, AppDbContext db) =>
		{
			var deleteMembership = await db.FamilyMemberships.FirstOrDefaultAsync(fm => fm.FamilyId == familyId && fm.UserId == userId);

			if (deleteMembership != null)
			{
				db.FamilyMemberships.Remove(deleteMembership);
				await db.SaveChangesAsync();
				return Results.Ok(deleteMembership);
			}
			else
			{
				return Results.NotFound();
			}
		});

		// Get
		// Get users in a family
		app.MapGet("/families/{familyId}/users", async (long familyId, AppDbContext db) =>
			await db.FamilyMemberships
				.Where(fm => fm.FamilyId == familyId)
				.Include(fm => fm.User)
				.Select( fm => new
				{
					fm.User.Id,
					fm.User.Name,
					fm.User.Email,
					fm.Role
				})
				.ToListAsync());
	}
}