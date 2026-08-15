using Microsoft.EntityFrameworkCore;
using ServicoFaturamento.Models;
namespace ServicoFaturamento.Data;

public class FaturamentoDbContext : DbContext
{
     public FaturamentoDbContext(DbContextOptions<FaturamentoDbContext> options) : base(options) { }

    public DbSet<NotaFiscal>NotasFiscais{get;set;}
    public DbSet<NotaFiscalItem>NotaFiscalItens{get;set;}

}