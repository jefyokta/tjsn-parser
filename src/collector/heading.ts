import type { NodeI } from "../types/type";


export class HeadingCollector {

    static headings:NodeI[] =[]
    static _started:boolean = false;

    static add(head:NodeI)
    {
        this.headings.push(head)
    }

    static reset(){
        this._started = false;
        this.headings = [];
    }

    static start(){
        this._started = true;
    }

    static started(){
        return this._started;
    }

    static getAll(){
        return this.headings
    }
}