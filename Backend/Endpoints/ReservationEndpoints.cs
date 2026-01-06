using Microsoft.EntityFrameworkCore;
using ResourceScheduler.Data;
using ResourceScheduler.Models;
using ResourceScheduler.Auth;
using ResourceScheduler.Dtos;

namespace ResourceScheduler.Endpoints;

public static class ReservationEndpoints
{
	public static void MapReservationEndpoints(this WebApplication app)
	{
		// Post
		// Add a new reservation
		app.MapPost("/families/{familyId}/invite", async (long familyId, CreateInvite req, AppDbContext db, HttpContext ctx) =>
		{
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			var isOwner = await db.FamilyMemberships
				.AnyAsync(fm => fm.FamilyId == familyId && fm.UserId == userId.Value && fm.Role == "owner");
			if (!isOwner) return Results.Forbid();

			var invitedUser = await db.Users.FirstOrDefaultAsync(u => u.Name == req.InvitedUsername);
			if (invitedUser == null) return Results.NotFound();

			var invitedUserId = invitedUser.Id;

			var alreadyInvited = await db.FamilyInvitations
				.AnyAsync(i => i.FamilyId == familyId && i.InvitedUserId == invitedUserId && !i.Accepted);
			var alreadyMember = await db.FamilyMemberships
				.AnyAsync(fm => fm.FamilyId == familyId && fm.UserId == invitedUserId);
			if (alreadyInvited || alreadyMember)
				return Results.Conflict("User is already invited or already a member.");

			var invite = new FamilyInvitation
			{
				FamilyId = familyId,
				InvitedUserId = invitedUserId,
				InviterUserId = userId.Value
			};

			db.FamilyInvitations.Add(invite);
			await db.SaveChangesAsync();
			return Results.Created($"/families/{familyId}/invite/{invite.Id}", invite);
		})
		.RequireAuthorization();



		// Get
		// Get all reservations for a family
		app.MapGet("/reservations/family/{familyId}", async (long familyId, AppDbContext db, HttpContext ctx) => {
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Ensure the user is a member of the family
			var member = await db.FamilyMemberships.AnyAsync(fm => fm.FamilyId == familyId && fm.UserId == userId);
			if (!member) return Results.Forbid();
			
			// Get the reservations
			var reservations = await db.Reservations
			.Where(r => r.FamilyId == familyId)
			.OrderBy(r => r.StartTime)
			.ToListAsync();

			return Results.Ok(reservations);
		})
		.RequireAuthorization();



		// Get
		// Get all reservations for a family of a specific type
		app.MapGet("/reservations/family/{familyId}/type/{type}", async(long familyId, string type, AppDbContext db, HttpContext ctx) => {
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Ensure the user is a member of the family
			var member = await db.FamilyMemberships.AnyAsync(fm => fm.FamilyId == familyId && fm.UserId == userId);
			if (!member) return Results.Forbid();
			
			// Get the reservations
			var reservations = await db.Reservations
			.Include(r => r.Item)
			.Where(r => r.FamilyId == familyId && r.Item.Type == type)
			.ToListAsync();

			return Results.Ok(reservations);
		})
		.RequireAuthorization();



		// Get
		// Get all reservations for a specific item
		app.MapGet("/reservations/item/{itemId}", async (long itemId, AppDbContext db, HttpContext ctx) => {
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Get the item
			var item = await db.Items.FirstOrDefaultAsync(i => i.Id == itemId);
			if (item == null) return Results.NotFound();

			// Ensure the user is in the item's family
			var member = await db.FamilyMemberships.AnyAsync(fm => fm.FamilyId == item.FamilyId && fm.UserId == userId);
			if (!member) return Results.Forbid();
			
			// Get the reservations
			var reservations = await db.Reservations
			.Where(r => r.ItemId == itemId)
			.OrderBy(r => r.StartTime)
			.ToListAsync();

			return Results.Ok(reservations);
		})
		.RequireAuthorization();



		// Get
		// Get a reservation by its id
		app.MapGet("/reservations/{reservationId}", async (long reservationId, AppDbContext db, HttpContext ctx) => {
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Get the reservation
			var reservation = await db.Reservations.FirstOrDefaultAsync(r => r.Id == reservationId);
			if (reservation == null) return Results.NotFound();

			// Ensure the reservation and the user belong to the same family
			var member = await db.FamilyMemberships.AnyAsync(fm => fm.FamilyId == reservation.FamilyId && fm.UserId == userId);
			if (!member) return Results.Forbid();

			return Results.Ok(reservation);
		})
		.RequireAuthorization();



		// Get
		// Get all reservations for a specific user
		app.MapGet("/reservations/user", async (AppDbContext db, HttpContext ctx) => {
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Get the reservations
			var reservations = await db.Reservations
			.Where(r => r.UserId == userId)
			.Include(r => r.Item)
			.Select(r => new
				{
					r.Id,
					r.FamilyId,
					r.ItemId,
					ItemName = r.Item.Name,
					r.StartTime,
					r.EndTime
				})
			.OrderBy(r => r.StartTime)
			.ToListAsync();

			return Results.Ok(reservations);
		})
		.RequireAuthorization();



		// Put
		// Update a reservation
		app.MapPut("/reservations/{reservationId}", async (long reservationId, Reservation reservation, AppDbContext db, HttpContext ctx) =>
		{
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Validate start/end times
			if (reservation.StartTime >= reservation.EndTime)
				return Results.BadRequest("Start time must be before end time.");

			// Start a transaction
			await using var transaction = await db.Database.BeginTransactionAsync();

			// Get the reservation to update
			var existingReservation = await db.Reservations.FirstOrDefaultAsync(r => r.Id == reservationId);
			if (existingReservation == null)
				return Results.NotFound();

			// Ensure the user has permission to update the reservation
			var canUpdate = existingReservation.UserId == userId
				|| await db.FamilyMemberships.AnyAsync(fm => fm.FamilyId == existingReservation.FamilyId
					&& fm.UserId == userId && (fm.Role == "owner" || fm.Role == "admin"));

			if (!canUpdate) return Results.Forbid();

			// Ensure the new item exists and belongs to the same family
			var item = await db.Items.FirstOrDefaultAsync(i => i.Id == reservation.ItemId);
			if (item == null) return Results.NotFound("Item not found.");
			if (item.FamilyId != existingReservation.FamilyId) return Results.Forbid();

			// Check for overlapping reservations for the same item
			var overlapping = await db.Reservations
				.Where(r => r.Id != reservationId
							&& r.ItemId == reservation.ItemId
							&& r.StartTime < reservation.EndTime
							&& r.EndTime > reservation.StartTime)
				.AnyAsync();

			if (overlapping) return Results.Conflict("Item is already reserved during this time.");

			// Update the reservation
			existingReservation.ItemId = reservation.ItemId;
			existingReservation.StartTime = reservation.StartTime;
			existingReservation.EndTime = reservation.EndTime;

			await db.SaveChangesAsync();

			// Commit the transaction
			await transaction.CommitAsync();

			return Results.Ok(existingReservation);
		})
		.RequireAuthorization();



		// Delete
		// Delete a reservation
		app.MapDelete("/reservations/{reservationId}", async (long reservationId, AppDbContext db, HttpContext ctx) =>
		{
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Start a transaction
			await using var transaction = await db.Database.BeginTransactionAsync();

			// Get the reservation to delete
			var deleteReservation = await db.Reservations.FirstOrDefaultAsync(r => r.Id == reservationId);
			if (deleteReservation == null) return Results.NotFound();

			// Ensure the user has permission to delete
			var canDelete = deleteReservation.UserId == userId
				|| await db.FamilyMemberships.AnyAsync(fm => fm.FamilyId == deleteReservation.FamilyId
					&& fm.UserId == userId && (fm.Role == "owner" || fm.Role == "admin"));

			if (!canDelete) return Results.Forbid();

			// Delete the reservation
			db.Reservations.Remove(deleteReservation);
			await db.SaveChangesAsync();

			// Commit the transaction
			await transaction.CommitAsync();

			return Results.Ok(deleteReservation);
		})
		.RequireAuthorization();
	}
}