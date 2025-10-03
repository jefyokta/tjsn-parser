
export type CaptionData={caption:HTMLElement[],id:string}

export type CaptionCounterData = CaptionData & {counter:string}

export default class Counter {
    private static h1Counter:number=0;
    private static imageCounter:number=0;
    private static tableCounter:number=0;
    private static tables:CaptionCounterData[]=[];
    private static images:CaptionCounterData[]=[];
    static increaseHeading(){
        this.h1Counter++
        this.tableCounter =0;
        this.imageCounter =0;

    }

    static getTables(){
        return this.tables
    }
    static getImages(){
        return this.images
    }
    static increaseImage(){
        this.imageCounter++
    }

    static increaseTable(){
        this.tableCounter++
    }

    static getImageCounter(id:string):CaptionCounterData|undefined{
       const targ = this.images.find(e=>e.id == id)
       if (targ) {
        const {caption,id ,counter} = targ
        return {
            id,
            caption,
            counter           
        }        
       }
    }

    static getTableCounter(id:string):CaptionCounterData|undefined{
       const targ = this.tables.find(e=>e.id == id)
       if (targ) {
        const {caption,id ,counter} = targ
        return {
            id,
            caption,
            counter           
        }
        
       }

    }
    static addImage(data:CaptionData){
        this.images.push({counter:`${this.h1Counter}.${this.imageCounter}.`,...data})
    }
      static addTable(data:CaptionData){
        this.tables.push({counter:`${this.h1Counter}.${this.tableCounter}.`,...data})
    }
}