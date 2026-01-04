using Microsoft.EntityFrameworkCore;
using ResourceScheduler.Data;
using ResourceScheduler.Models;

namespace ResourceScheduler.Endpoints;

public static class ReservationEndpoints
{
	public static void MapReservationEndpoints(this WebApplication app)
	{
		// Post
		// Add a new reservation
		app.MapPost("/reservations", async (Reservation reservation, AppDbContext db) =>
		{
			var overlapping = await db.Reservations
				.Where(r => r.ItemId == reservation.ItemId
				&& r.StartTime < reservation.EndTime && r.EndTime > reservation.StartTime)
				.AnyAsync();
			
			if (overlapping)
				return Results.Conflict("Item is already reserved during this time.");
			
			db.Reservations.Add(reservation);
			await db.SaveChangesAsync();
			return Results.Created($"/reservations/{reservation.Id}", reservation);
		});

		// Get
		// Get all reservations
		app.MapGet("/reservations", async (AppDbContext db) =>
			await db.Reservations.ToListAsync());

		// Get
		// Get all reservations for a family
		app.MapGet("/reservations/family/{familyId}", async (long familyId, AppDbContext db) =>
			await db.Reservations
			.Where(r => r.FamilyId == familyId)
			.ToListAsync());

		// Get
		// Get all reservations for a family of a specific type
		app.MapGet("/reservations/family/{familyId}/type/{type}", async(long familyId, string type, AppDbContext db) =>
			await db.Reservations
			.Where(r => r.FamilyId == familyId && string.Compare(r.Item.Type, type) == 0)
			.ToListAsync());

		// Get
		// Get all reservations for a specific item
		app.MapGet("/reservations/item/{itemId}", async (long itemId, AppDbContext db) => 
			await db.Reservations
			.Where(r => r.ItemId == itemId)
			.ToListAsync());

		// Get
		// Get a reservation by its id
		app.MapGet("/reservations/{reservationId}", async (long reservationId, AppDbContext db) =>
			await db.Reservations
			.FirstOrDefaultAsync(r => r.Id == reservationId));

		// Get
		// Get all reservations for a specific user
		app.MapGet("/reservations/user/{userId}", async (long userId, AppDbContext db) =>
			await db.Reservations
			.Where(r => r.UserId == userId)
			.ToListAsync());

		// Put
		// Update a reservation
		app.MapPut("/reservations/{reservationId}", async (long reservationId, Reservation reservation, AppDbContext db) =>
		{
			var existingReservation = await db.Reservations.FirstOrDefaultAsync(r => r.Id == reservationId);

			if (existingReservation != null)
			{
				var overlapping = await db.Reservations
					.Where(r => r.Id != reservationId
					&& r.ItemId == reservation.ItemId
					&& r.StartTime < reservation.EndTime && r.EndTime > reservation.StartTime)
					.AnyAsync();
				if (overlapping) return Results.Conflict("Item is already reserved during this time.");

				existingReservation.StartTime = reservation.StartTime;
				existingReservation.EndTime = reservation.EndTime;
				await db.SaveChangesAsync();
				return Results.Ok(existingReservation);
			}
			else
			{
				return Results.NotFound();
			}
		});

		// Delete
		// Delete a reservation
		app.MapDelete("/reservations/{reservationId}", async (long reservationId, AppDbContext db) =>
		{
			var deleteReservation = await db.Reservations.FirstOrDefaultAsync(i => i.Id == reservationId);

			if (deleteReservation != null)
			{
				db.Reservations.Remove(deleteReservation);
				await db.SaveChangesAsync();
				return Results.Ok(deleteReservation);
			}
			else
			{
				return Results.NotFound();
			}
		});
	}
}