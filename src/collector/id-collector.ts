


export class IdCollector {

    static id = 0
    static getId(id:string):string{
        this.id++
        return `el-${this.id}`
    }

}