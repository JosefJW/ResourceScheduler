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
		app.MapPost("/reservations", async (CreateReservation req, AppDbContext db, HttpContext ctx) =>
		{
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Ensure the reservation has valid start and end times
			if (req.StartTime >= req.EndTime)
				return Results.BadRequest("Start time must be before end time.");

			// Get the full item object
			var item = await db.Items.FirstOrDefaultAsync(i => i.Id == req.ItemId);
			if (item == null) return Results.NotFound();

			// Ensure the user is the item's family
			var member = await db.FamilyMemberships.AnyAsync(fm => fm.FamilyId == item.FamilyId && fm.UserId == userId);
			if (!member) return Results.Forbid();

			// Start a transaction
			using var transaction = await db.Database.BeginTransactionAsync();

			// Ensure the reservation doesn't overlap with any other reservation
			var overlapping = await db.Reservations
				.Where(r => r.ItemId == req.ItemId
				&& r.StartTime < req.EndTime && r.EndTime > req.StartTime)
				.AnyAsync();
			if (overlapping)
				return Results.Conflict("Item is already reserved during this time.");

			// Make the reservation
			var reservation = new Reservation
			{
				ItemId = req.ItemId,
				FamilyId = item.FamilyId,
				UserId = (long)userId,
				StartTime = req.StartTime,
				EndTime = req.EndTime
			};
			db.Reservations.Add(reservation);
			await db.SaveChangesAsync();

			// End the transaction
			await transaction.CommitAsync();

			var res = new CreateReservationResponse(
				reservation.Id,
				reservation.ItemId,
				item.Name,
				reservation.FamilyId,
				reservation.UserId,
				reservation.StartTime,
				reservation.EndTime
			);

			return Results.Created($"/reservations/{reservation.Id}", res);
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
			.Select(r => new
			{
				r.Id,
				r.FamilyId,
				r.ItemId,
				ItemName = r.Item.Name,
				r.StartTime,
				r.EndTime
			})
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
	
	
	
		// Get
		// Check if there is an overlapping reservation for a specific item at a specified time
		app.MapGet("/reservations/item/{itemId}/from/{startTime}/to/{endTime}",
			async (long itemId, DateTimeOffset startTime, DateTimeOffset endTime, AppDbContext db, HttpContext ctx) =>
			{
				bool overlaps = await db.Reservations
					.AnyAsync(r => r.ItemId == itemId &&
						r.StartTime < endTime &&
						r.EndTime > startTime);

				return Results.Ok(new { available = !overlaps });
			}
		)
		.RequireAuthorization();
	}
}