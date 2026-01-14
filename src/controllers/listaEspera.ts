import { Request, Response, NextFunction } from "express";
import ListaEspera from "../models/listaEspera.model";

/*Precisa primeiro implementar a autenticação e autorização para depois construir
  esse controller  vai pegar o usuário autenticado, verificar qual é a role dele,
  se a role dele for almoxarife ele precisa pegar em qual obra ele está trabalhando
  depois em quais centro de custo ele tem acesso e ai liberar certas coisas ou aparecer
  certas opções pra ele na tela. */
