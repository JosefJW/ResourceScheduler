using Microsoft.EntityFrameworkCore;
using ResourceScheduler.Data;
using ResourceScheduler.Models;
using System.Security.Claims;
using ResourceScheduler.Auth;
using ResourceScheduler.Dtos;

namespace ResourceScheduler.Endpoints;

public static class FamilyEndpoints
{
	public static void MapFamilyEndpoints(this WebApplication app)
	{
		// Post
		// Add a family to the database
		app.MapPost("/families", async (CreateFamily createFamily, AppDbContext db, HttpContext ctx) =>
		{
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Start a transaction
			using var transaction = await db.Database.BeginTransactionAsync();

			var family = new Family
			{
				Name = createFamily.Name
			};

			// Save the new family to the database
			db.Families.Add(family);
			await db.SaveChangesAsync();

			// Add the user as an owner of the family
			var membership = new FamilyMembership
			{
				FamilyId = family.Id,
				UserId = userId.Value,
				Role = "owner"	
			};
			db.FamilyMemberships.Add(membership);
			await db.SaveChangesAsync();

			// Finish the transaction
			await transaction.CommitAsync();

			// Return the new family
			return Results.Created($"families/{family.Id}", new CreateFamilyResponse
			{
				Id = family.Id,
				Name = family.Name
			});
		})
		.RequireAuthorization();



		// Get
		// Get a list of all families the user is in
		app.MapGet("/families", async (AppDbContext db, HttpContext ctx) => {
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Get all families that the user is a member of
			var families = await db.FamilyMemberships
			.Where(fm => fm.UserId == userId.Value)
			.Select(fm => new
			{
				fm.Family.Id,
				fm.Family.Name
			})
			.ToListAsync();

			// Return families
			return Results.Ok(families);
		})
		.RequireAuthorization();



		// Get
		// Get a family by id
		app.MapGet("/families/{familyId}", async (long familyId, AppDbContext db, HttpContext ctx) => {
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Check if the user is a member of the specified family
			var isMember = await db.FamilyMemberships
				.AnyAsync(fm => fm.UserId == userId.Value && fm.FamilyId == familyId);
			if (!isMember) return Results.Forbid();

			// Get the family name
			var family = await db.Families.FindAsync(familyId);
			if (family == null) return Results.NotFound();

			// Return the family if it exists
			return Results.Ok(new
			{
				familyName = family.Name
			});
		})
		.RequireAuthorization();



		// Delete
		// Delete the family with the specified id
		app.MapDelete("/families/{familyId}", async(long familyId, AppDbContext db, HttpContext ctx) =>
		{
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Ensure the user is the owner of the family
			var owner = await db.FamilyMemberships.AnyAsync(fm => fm.FamilyId == familyId
				&& fm.UserId == userId
				&& fm.Role == "owner");
			if (!owner) return Results.Forbid();

			// Delete the family
			var deleteFamily = await db.Families.FirstOrDefaultAsync(family => family.Id == familyId);
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
		})
		.RequireAuthorization();


		// Post
		// Make an invitation to a family
		app.MapPost("/families/{familyId}/invite", async (long familyId, CreateInvite req, AppDbContext db, HttpContext ctx) =>
		{
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Only owners can invite
			var isOwner = await db.FamilyMemberships
				.AnyAsync(fm => fm.FamilyId == familyId && fm.UserId == userId.Value && fm.Role == "owner");
			if (!isOwner) return Results.Forbid();

			// Get invited user
			var invitedUser = await db.Users
				.FirstOrDefaultAsync(u => u.Name == req.InvitedUsername);
			if (invitedUser == null) return Results.NotFound();

			// Get invited userId
			var invitedUserId = invitedUser.Id;

			// Check if already invited or already a member
			var alreadyInvited = await db.FamilyInvitations
				.AnyAsync(i => i.FamilyId == familyId && i.InvitedUserId == invitedUserId && !i.Accepted);
			var alreadyMember = await db.FamilyMemberships
				.AnyAsync(fm => fm.FamilyId == familyId && fm.UserId == invitedUserId);
			if (alreadyInvited || alreadyMember)
				return Results.Conflict("User is already invited or already a member.");

			// Create an invitation
			var invite = new FamilyInvitation
			{
				FamilyId = familyId,
				InvitedUserId = invitedUserId,
				InviterUserId = userId.Value
			};

			// Add the invitation to the db
			db.FamilyInvitations.Add(invite);
			await db.SaveChangesAsync();
			return Results.Created($"/families/{familyId}/invite/{invite.Id}", invite);
		})
		.RequireAuthorization();



		// Post
		// Accept an invitation to a family
		app.MapPost("/families/{familyId}/invite/{inviteId}/accept", async (long familyId, long inviteId, AppDbContext db, HttpContext ctx) =>
		{
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Problem(
				detail: "Must be logged in.",
				statusCode: 401
			);

			// Get the invite
			var invite = await db.FamilyInvitations
				.FirstOrDefaultAsync(i => i.Id == inviteId && i.FamilyId == familyId && i.InvitedUserId == userId.Value);
			if (invite == null) return Results.Problem(
				detail: "Invitation not found.",
				statusCode: 404
			);
			if (invite.Responded) return Results.Conflict("Invitation already responded to.");

			// Add the user as a member
			var membership = new FamilyMembership
			{
				FamilyId = familyId,
				UserId = userId.Value,
				Role = "member"
			};
			db.FamilyMemberships.Add(membership);

			// Update invite response
			invite.Responded = true;
			invite.Accepted = true;
			invite.RespondedAt = DateTime.UtcNow;
			await db.SaveChangesAsync();

			return Results.Ok(membership);
		})
		.RequireAuthorization();



		// Post
		// Decline an invitation to a family
		app.MapPost("/families/{familyId}/invite/{inviteId}/decline", async (long familyId, long inviteId, AppDbContext db, HttpContext ctx) =>
		{
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Get the invite
			var invite = await db.FamilyInvitations
				.FirstOrDefaultAsync(i => i.Id == inviteId && i.FamilyId == familyId && i.InvitedUserId == userId.Value);
			if (invite == null) return Results.NotFound();
			if (invite.Responded) return Results.Conflict("Invitation already responded to.");

			// Update invite response
			invite.Responded = true;
			invite.Accepted = false;
			invite.RespondedAt = DateTime.UtcNow;
			await db.SaveChangesAsync();

			return Results.Ok();
		})
		.RequireAuthorization();



		// Get
		// Get all pending invitiations for a user
		app.MapGet("/families/invitations", async (AppDbContext db, HttpContext ctx) =>
		{
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Get all invites for that user
			var invites = await db.FamilyInvitations
				.Where(i => i.InvitedUserId == userId.Value && !i.Responded)
				.Include(i => i.Family)
				.Include(i => i.InviterUser)
				.Select(i => new
				{
					i.Id,
					FamilyId = i.FamilyId,
					FamilyName = i.Family.Name,
					InviterName = i.InviterUser.Name,
					i.CreatedAt
				})
				.ToListAsync();

			// Return the invites
			return Results.Ok(invites);
		})
		.RequireAuthorization();



		// Delete
		// Remove a user from a family
		app.MapDelete("/families/{familyId}/users/{userId}", async (long familyId, long userId, AppDbContext db, HttpContext ctx) =>
		{
			// Get the caller's userId from JWT
			var callerId = HttpContextExtensions.GetUserId(ctx);
			if (callerId == null) return Results.Unauthorized();

			// Fetch the membership of the caller and the target user
			var callerMembership = await db.FamilyMemberships
				.FirstOrDefaultAsync(fm => fm.FamilyId == familyId && fm.UserId == callerId.Value);
			if (callerMembership == null) return Results.Unauthorized();

			var targetMembership = await db.FamilyMemberships
				.FirstOrDefaultAsync(fm => fm.FamilyId == familyId && fm.UserId == userId);
			if (targetMembership == null) return Results.NotFound();

			// Case 1: Self-removal
			if (callerId.Value == userId)
			{
				if (callerMembership.Role == "owner") return Results.Problem(
					detail: "Transfer ownership before leaving the family.",
					statusCode: 403
				);
				db.FamilyMemberships.Remove(targetMembership);
				await db.SaveChangesAsync();
				return Results.Ok(targetMembership);
			}

			// Case 2: Owner/Admin removing a member
			if (targetMembership.Role == "member" && (callerMembership.Role == "owner" || callerMembership.Role == "admin"))
			{
				db.FamilyMemberships.Remove(targetMembership);
				await db.SaveChangesAsync();
				return Results.Ok(targetMembership);
			}

			// Case 3: Owner removing an admin
			if (targetMembership.Role == "admin" && callerMembership.Role == "owner")
			{
				db.FamilyMemberships.Remove(targetMembership);
				await db.SaveChangesAsync();
				return Results.Ok(targetMembership);
			}

			// Otherwise, unauthorized
			return Results.Forbid();
		})
		.RequireAuthorization();



		// Get
		// Get users in a family
		app.MapGet("/families/{familyId}/users", async (long familyId, AppDbContext db, HttpContext ctx) => {
			// Get the userId from JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Check that the user is a member of the family
			var isMember = await db.FamilyMemberships.AnyAsync(fm => fm.FamilyId == familyId && fm.UserId == userId);
			if (!isMember) return Results.Forbid();

			// Get the users
			var users = await db.FamilyMemberships
				.Where(fm => fm.FamilyId == familyId)
				.Include(fm => fm.User)
				.Select( fm => new
				{
					fm.User.Id,
					fm.User.Name,
					fm.User.Email,
					fm.Role
				})
				.OrderBy(fm => 
					fm.Role == "owner" ? 0 :
					fm.Role == "admin" ? 1 :
					fm.Role == "member" ? 2 :
					3
				)
				.ToListAsync();

			return Results.Ok(users);
		})
		.RequireAuthorization();
	}
}