


export class IdCollector {

    static id:string[] = ['']


    static getId(id:string):string{
        if (this.id.includes(id)) {
            return this.getId(id+'x')
        }

        return id;


    }

}