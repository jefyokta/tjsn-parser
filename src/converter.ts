import { Converter } from "./converter-node";

export class T {
private converter:Converter;
constructor(){
    this.converter = new Converter;

}

  render(nodes:NodeI[],appendTo:HTMLElement){


  const elmns =  nodes.map(n=>{
     return this.converter.parse(n)
    })

    console.log(elmns)

    appendTo.append(...elmns)




  }
}