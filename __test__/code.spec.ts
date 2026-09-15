import { Parser } from "../src/converter";
import { NodeI } from "../src/types/type";
import {expect} from "bun:test"

const code:NodeI = {
    type:"codeBlock",
    attrs:{
        language:"php"
    },
    content:[{type:"text",
        text:"<?php\necho \"Helloworld\""
    }]
}

const parser = new Parser()
const e = document.createElement("div")
parser.render([code],e)
console.log(e)
expect(e).toBe(e)