using Microsoft.EntityFrameworkCore;
using ResourceScheduler.Data;
using ResourceScheduler.Models;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using ResourceScheduler.Dtos;
using ResourceScheduler.Auth;

namespace ResourceScheduler.Endpoints;

public static class UserEndpoints
{
	private static (string Hash, string Salt) HashPassword(string password)
	{
		byte[] salt = RandomNumberGenerator.GetBytes(128 / 8);
		byte[] hash = KeyDerivation.Pbkdf2(
			password: password,
			salt: salt,
			prf: KeyDerivationPrf.HMACSHA256,
			iterationCount: 100000,
			numBytesRequested: 256 / 8
		);

		return (Convert.ToBase64String(hash), Convert.ToBase64String(salt));
	}

	private static bool PasswordsMatch(string password, string hash, string salt)
	{
		byte[] saltBytes = Convert.FromBase64String(salt);

		string hashOfInput = Convert.ToBase64String(
			KeyDerivation.Pbkdf2(
				password: password,
				salt: saltBytes,
				prf: KeyDerivationPrf.HMACSHA256,
				iterationCount: 100000,
				numBytesRequested: 256 / 8
			)
		);

		return hashOfInput == hash;
	}

	public static void MapUserEndpoints(this WebApplication app)
	{
		// Post
		// Create a new user
		app.MapPost("/signup", async (SignupRequest req, AppDbContext db, IConfiguration config) =>
		{
			if (req.Username.Length < 3) return Results.Problem(
					detail: "Username is too short.",
					statusCode: 400 // BadRequest
				);
			if (req.Username.Length > 32) return Results.Problem(
					detail: "Username is too long.",
					statusCode: 400 // BadRequest
				);

			var usernameTaken = await db.Users.AnyAsync(u => u.Name == req.Username);
			if (usernameTaken) return Results.Problem(
					detail: "Username is taken.",
					statusCode: 409 // Conflict	
				);

			var emailTaken = await db.Users.AnyAsync(u => u.Email == req.Email);
			if (emailTaken) return Results.Problem(
					detail: "Email is taken.",
					statusCode: 409 // Conflict
				);

			var (hash, salt) = HashPassword(req.Password);
			
			var user = new User
			{
				Name = req.Username,
				Email = req.Email,
				PasswordHash = hash,
				PasswordSalt = salt
			};

			db.Users.Add(user);
			await db.SaveChangesAsync();

			var token = JwtService.GenerateToken(user, config);
			
			return Results.Ok(new
			{
				token
			});
		});



		// Post
		// Login
		app.MapPost("/login", async (LoginRequest req, AppDbContext db, IConfiguration config) =>
		{
			var user = await db.Users.FirstOrDefaultAsync(u => u.Name == req.Username);
			if (user == null) return Results.Problem(
					detail: "Username not found.",
					statusCode: 404
				);

			if (!PasswordsMatch(req.Password, user.PasswordHash, user.PasswordSalt))
				return Results.Problem(
					detail: "Incorrect password.",
					statusCode: 401
				);
			
			var token = JwtService.GenerateToken(user, config);

			return Results.Ok(new
			{
				token
			});
		});



		// Get id
		// Get the current user
		app.MapGet("/user", async (AppDbContext db, HttpContext ctx) => {
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Get the user
			var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
			
			if (user == null) return Results.NotFound();
			return Results.Ok(new
			{
				username = user.Name,
				email = user.Email
			});
		})
		.RequireAuthorization();



		// Put
		// Update user's name
		app.MapPut("/user/name", async (UpdateUsername req, AppDbContext db, HttpContext ctx) =>
		{
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Get the user
			var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
			if (user == null) return Results.NotFound();

			// Update the user
			user.Name = req.NewName;
			await db.SaveChangesAsync();

			return Results.Ok();
		})
		.RequireAuthorization();



		// Put
		// Update user's email
		app.MapPut("/user/email", async (UpdateEmail req, AppDbContext db, HttpContext ctx) =>
		{
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Ensure the email is unique
			var emailExists = await db.Users.AnyAsync(u => u.Email == req.NewEmail && u.Id != userId);
			if (emailExists) return Results.Conflict("Email is already in use.");

			// Get the user
			var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
			if (user == null) return Results.NotFound();

			// Update the user
			user.Email = req.NewEmail;
			await db.SaveChangesAsync();

			return Results.Ok(user);
		})
		.RequireAuthorization();



		// Put
		// Update user's password
		app.MapPut("/user/password", async (UpdatePassword req, AppDbContext db, HttpContext ctx) =>
		{
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Get the user
			var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
			if (user == null) return Results.NotFound();

			// Check current password matches
			if (!PasswordsMatch(req.OldPassword, user.PasswordHash, user.PasswordSalt))
				return Results.Forbid();

			// Update to new password
			(user.PasswordHash, user.PasswordSalt) = HashPassword(req.NewPassword);
			await db.SaveChangesAsync();

			return Results.Ok();
		})
		.RequireAuthorization();



		// Delete user
		// Delete the user with the specified id
		app.MapDelete("/users/{userId}", async(long userId, AppDbContext db, HttpContext ctx) =>
		{
			// Get the userId from the JWT
			var jwtUserId = HttpContextExtensions.GetUserId(ctx);
			if (jwtUserId == null) return Results.Unauthorized();
			if (jwtUserId != userId) return Results.Forbid();

			// Get the user to delete
			var deleteUser = await db.Users.FirstOrDefaultAsync(user => user.Id == userId);
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
		})
		.RequireAuthorization();
	}
}