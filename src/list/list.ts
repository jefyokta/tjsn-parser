import ImageList from "./image";
import TableList from "./table";


export default class List{
    public readonly table:TableList;
    public readonly image:ImageList;
    constructor(table:string,image:string){
        this.table = new TableList(table)   
        this.image = new ImageList(image)     
    }
}