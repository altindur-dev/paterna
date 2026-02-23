using System.Security.Cryptography;
using System.Text;
using Paterna.Application;
using Paterna.Domain;

namespace Paterna.Infrastructure;

public sealed class InMemoryProductRepository : IProductRepository
{
    private static readonly IReadOnlyCollection<Product> Products =
    [
        new Product { Name = "Architect Desk", Description = "Solid wood desk for creative work", Price = 350 },
        new Product { Name = "Blueprint Lamp", Description = "Minimal lamp for focused sessions", Price = 85 },
        new Product { Name = "Studio Chair", Description = "Ergonomic chair for long design sprints", Price = 180 }
    ];

    public Task<IReadOnlyCollection<Product>> GetProductsAsync(CancellationToken cancellationToken = default) => Task.FromResult(Products);
}

public sealed class InMemoryUserRepository : IUserRepository
{
    private readonly Dictionary<string, User> _users = new(StringComparer.OrdinalIgnoreCase);

    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        _users.TryGetValue(email, out var user);
        return Task.FromResult(user);
    }

    public Task<User> SaveAsync(User user, CancellationToken cancellationToken = default)
    {
        _users[user.Email] = user;
        return Task.FromResult(user);
    }
}

public sealed class Sha256PasswordHasher : IPasswordHasher
{
    public string Hash(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }

    public bool Verify(string password, string hash) => Hash(password) == hash;
}

public sealed class BasicTokenFactory : ITokenFactory
{
    public string Create(User user)
    {
        var payload = $"{user.Id}:{user.Email}:{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(payload));
    }
}
