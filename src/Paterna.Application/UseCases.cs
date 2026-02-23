using Paterna.Domain;

namespace Paterna.Application;

public sealed record SignupCommand(string Name, string Email, string Password);
public sealed record LoginCommand(string Email, string Password);
public sealed record AuthResult(string Token, string Name, string Email);

public sealed class AuthService
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenFactory _tokenFactory;

    public AuthService(IUserRepository users, IPasswordHasher passwordHasher, ITokenFactory tokenFactory)
    {
        _users = users;
        _passwordHasher = passwordHasher;
        _tokenFactory = tokenFactory;
    }

    public async Task<AuthResult> SignupAsync(SignupCommand command, CancellationToken cancellationToken = default)
    {
        var existing = await _users.GetByEmailAsync(command.Email, cancellationToken);
        if (existing is not null)
        {
            throw new InvalidOperationException("Email is already registered.");
        }

        var user = new User
        {
            Name = command.Name,
            Email = command.Email,
            PasswordHash = _passwordHasher.Hash(command.Password)
        };

        var saved = await _users.SaveAsync(user, cancellationToken);
        return new AuthResult(_tokenFactory.Create(saved), saved.Name, saved.Email);
    }

    public async Task<AuthResult> LoginAsync(LoginCommand command, CancellationToken cancellationToken = default)
    {
        var user = await _users.GetByEmailAsync(command.Email, cancellationToken)
            ?? throw new UnauthorizedAccessException("Invalid credentials.");

        var isValid = _passwordHasher.Verify(command.Password, user.PasswordHash);
        if (!isValid)
        {
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        return new AuthResult(_tokenFactory.Create(user), user.Name, user.Email);
    }
}

public sealed class ProductService
{
    private readonly IProductRepository _productRepository;

    public ProductService(IProductRepository productRepository) => _productRepository = productRepository;

    public Task<IReadOnlyCollection<Product>> GetProductsAsync(CancellationToken cancellationToken = default) =>
        _productRepository.GetProductsAsync(cancellationToken);
}
