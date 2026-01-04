using Microsoft.EntityFrameworkCore;
using ResourceScheduler.Data;
using ResourceScheduler.Models;

namespace ResourceScheduler.Endpoints;

public static class UserEndpoints
{
	public static void MapUserEndpoints(this WebApplication app)
	{
		// Post
		// Add a user to the database
		app.MapPost("/users", async (User user, AppDbContext db) =>
		{
			db.Users.Add(user);
			await db.SaveChangesAsync();
			return Results.Created($"/users/{user.Id}", user);
		});

		// Get
		// Get all users from the database as a list
		app.MapGet("/users", async(AppDbContext db) =>
			await db.Users.ToListAsync());

		// Get id
		// Get the user with the specified id
		app.MapGet("/users/{id}", async (long id, AppDbContext db) =>
			await db.Users.FindAsync(id) is User user ? Results.Ok(user) : Results.NotFound());
	
		// Update user
		// Update the information for the user with the specified id
		app.MapPut("/users/{id}", async (long id, User user, AppDbContext db) =>
		{
			var existingUser = await db.Users.FirstOrDefaultAsync(u => u.Id == id);

			if (existingUser != null)
			{
				existingUser.Name = user.Name;
				existingUser.Email = user.Email;
				await db.SaveChangesAsync();
				return Results.Ok(existingUser);
			}
			else
			{
				return Results.NotFound();
			}
		});

		// Delete user
		// Delete the user with the specified id
		app.MapDelete("/users/{id}", async(long id, AppDbContext db) =>
		{
			var deleteUser = await db.Users.FirstOrDefaultAsync(user => user.Id == id);

			if (deleteUser != null)
			{
				db.Users.Remove(deleteUser);
				await db.SaveChangesAsync();
				return Results.Ok(deleteUser);
			}
			else
			{
				return Results.NotFound();
			}
		});
	}
}