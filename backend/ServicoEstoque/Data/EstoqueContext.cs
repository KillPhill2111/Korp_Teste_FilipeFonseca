using Microsoft.EntityFrameworkCore;
using ServicoEstoque.Models;

namespace ServicoEstoque.Data;

public class EstoqueDbContext: DbContext
{
    public EstoqueDbContext(DbContextOptions<EstoqueDbContext>options):base(options){}
    public DbSet<Produto> Produtos{get;set;}
}