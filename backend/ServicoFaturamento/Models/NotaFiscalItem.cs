namespace ServicoFaturamento.Models;

public class NotaFiscalItem
{
    public int Id{get;set;}
    public int NotaFiscalId{get;set;}
    public string CodigoProduto{get;set;}=string.Empty;
    public int Quantidade{get;set;}
}