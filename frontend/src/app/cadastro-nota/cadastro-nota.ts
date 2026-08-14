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
  
  
  public produtosDisponiveis = [
    { codigo: 'PROD-001', descricao: 'Arroz Integral 1kg', saldo: 10 },
    { codigo: 'PROD-002', descricao: 'Feijão Carioca 1kg', saldo: 15 },
    { codigo: 'PROD-003', descricao: 'Óleo de Soja 900ml', saldo: 5 }
  ];

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
      console.log('Nota Fiscal pronta para enviar ao C#:', dadosNota);
      alert(`Nota ${dadosNota.numeracao} criada com sucesso com status Aberta!`);
      
      
      this.listaProdutos.clear();
      this.notaForm.patchValue({
        numeracao: 'NF-' + Math.floor(1000 + Math.random() * 9000),
        status: 'Aberta'
      });
      this.adicionarProduto();
    }
  }
}