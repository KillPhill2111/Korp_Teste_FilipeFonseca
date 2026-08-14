import { Routes } from '@angular/router';
import { CadastroProduto } from './cadastro-produto/cadastro-produto';
import { CadastroNota } from './cadastro-nota/cadastro-nota';

export const routes: Routes = [
  { path: '', redirectTo: 'produtos', pathMatch: 'full' },
  { path: 'produtos', component: CadastroProduto },
  { path: 'notas-fiscais', component: CadastroNota }
];