
export type CaptionData={caption:HTMLElement[],id:string}

export type CaptionCounterData = CaptionData & {counter:string}

export default class Counter {
    private static h1Counter:number=0;
    private static imageCounter:number=0;
    private static tableCounter:number=0;
    private static tables:CaptionCounterData[]=[];
    private static images:CaptionCounterData[]=[];
    private static alpha = false;
    static increaseHeading(){
        this.h1Counter++
        this.tableCounter =0;
        this.imageCounter =0;
    }

    static reset(){
        this.h1Counter =0;
        this.imageCounter =0;
        this.tableCounter =0;
        this.tables =[]
        this.images =[]
        this.alpha = false;
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
    static setAlpha() {
        this.alpha = true;
    }
    static addImage(data:CaptionData){
        this.images.push({counter:`${this.alpha ? this.getAlpha(this.h1Counter):this.h1Counter}.${this.imageCounter}`,...data})
    }
    static addTable(data:CaptionData){
        this.tables.push({counter:`${this.alpha ? this.getAlpha(this.h1Counter):this.h1Counter}.${this.tableCounter}`,...data})
    }

    static getAlpha(num: number): string {
        if (num <= 0) return "";
        let result = "";
        let n = num;

        while (n > 0) {
            n--; 
            result = String.fromCharCode(65 + (n % 26)) + result;
            n = Math.floor(n / 26);
        }

        return result;
    }

}