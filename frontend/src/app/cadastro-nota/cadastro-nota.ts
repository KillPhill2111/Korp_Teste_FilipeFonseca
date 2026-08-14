import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule,Validators } from '@angular/forms'

@Component({
  selector: 'app-cadastro-nota',
  standalone:true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './cadastro-nota.html',
  styleUrl: './cadastro-nota.css',
})
export class CadastroNota {
  private fb = inject(FormBuilder);
  public notaForm: FormGroup;

  public processandoImpressao:boolean=false;
  public notaSendoProcessada:string | null=null;
  
  
  public produtosDisponiveis = [
    { codigo: 'PROD-001', descricao: 'Arroz Integral 1kg', saldo: 10 },
    { codigo: 'PROD-002', descricao: 'Feijão Carioca 1kg', saldo: 15 },
    { codigo: 'PROD-003', descricao: 'Óleo de Soja 900ml', saldo: 5 }
  ];

  public notasFiscaisCriadas=[
    {numeracao:'NF-5432', status:'Aberta',itens:[{codigo:'PROD-001',quantidade:2}]},
    {numeracao:'NF-8812', status:'Fechada',itens:[{codigo:'PROD-002',quantidade:1}]}
  ]

  constructor() {
    this.notaForm = this.fb.group({
      
      numeracao: [{ value: 'NF-' + Math.floor(1000 + Math.random() * 9000), disabled: true }],
      status: [{ value: 'Aberta', disabled: true }],
      produtos: this.fb.array([]) 
    }); 
    this.adicionarProduto();
  }

  get listaProdutos(): FormArray {
    return this.notaForm.get('produtos') as FormArray;
  }
  
  adicionarProduto() {
    const produtoGrupo = this.fb.group({
      codigo: ['', [Validators.required]],
      quantidade: [1, [Validators.required, Validators.min(1)]]
    });
    this.listaProdutos.push(produtoGrupo);
  }

  removerProduto(index: number) {
    if (this.listaProdutos.length > 1) {
      this.listaProdutos.removeAt(index);
    }
  }

  salvarNota() {
    if (this.notaForm.valid) {
      const dadosNota = this.notaForm.getRawValue();

      const novosItens=this.listaProdutos.value

      this.notasFiscaisCriadas.unshift({
        numeracao:dadosNota.numeracao,
        status:dadosNota.status,
        itens:novosItens
      });


      alert(`Nota ${dadosNota.numeracao} criada com sucesso`)

      // console.log('Nota Fiscal pronta para enviar ao CSharp:', dadosNota);
      // alert(`Nota ${dadosNota.numeracao} criada com sucesso com status Aberta!`);
      
      this.listaProdutos.clear();
      this.notaForm.patchValue({
        numeracao: 'NF-' + Math.floor(1000 + Math.random() * 9000),
        status: 'Aberta'
      });
      this.adicionarProduto();
    }
  }

  imprimirNota(nota:any){
    if(nota.status!=='Aberta'){
      alert(`Erro: Não é permitido imprimir notas com status diferente de "Aberta"`)
      return
    }
    this.processandoImpressao=true;
    this.notaSendoProcessada=nota.numeracao;
    setTimeout(()=>{
      nota.status='Fechada';

      nota.itens.forEach((itemDaNota:any)=>{
        const produtoNoEstoque=this.produtosDisponiveis.find(p=>p.codigo===itemDaNota.codigo)
        if (produtoNoEstoque){
          produtoNoEstoque.saldo-=itemDaNota.quantidade
        }
      });

      this.processandoImpressao=false;
      this.notaSendoProcessada=null

      alert(`Nota ${nota.numeracao} processada, impressa e FECHADA com sucesso :D`)

    },2000)
  }
}