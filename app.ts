import { $, argv } from "bun";
import { type PackageJson } from "type-fest"; 

const commands: Record<string, () => any | Promise<any>> = {

    "version": async () => {
        const packageFile = Bun.file("package.json");
        const content: PackageJson = await packageFile.json();
        console.log("Version : " + content.version);
    },

    "version:increase": async () => {
        const packageFile = Bun.file("package.json");
        const content: PackageJson = await packageFile.json();
        const currentVersion: string = content.version!; 
        const vers = currentVersion.split(".");
        
        const patch = Number(vers[vers.length - 1]);
        const increasedPatch = patch + 1;
        vers[vers.length - 1] = increasedPatch.toString();
        
        const newVersion = vers.join(".");

        console.log("version upgrade from @" + currentVersion + " to @" + newVersion);
        content.version = newVersion;

        
        await Bun.write("package.json", JSON.stringify(content, null, 2));
    },

    "version:decrease": async () => {
        const packageFile = Bun.file("package.json");
        const content: PackageJson = await packageFile.json();
        const currentVersion: string = content.version!;
        const vers = currentVersion.split(".");
        const patch = Number(vers[vers.length - 1]);
        
        
        if (patch > 0) {
            const decreasedPatch = patch - 1;
            vers[vers.length - 1] = decreasedPatch.toString();
            const newVersion = vers.join(".");
            console.log("version downgrade from @" + currentVersion + " to @" + newVersion);
            content.version = newVersion;
            await Bun.write("package.json", JSON.stringify(content, null, 2));
        } else {
            console.log("Cannot decrease version further:", currentVersion);
        }
    },

    "pub:increase": async () => {
        try {
            
            await commands["version:increase"]();                        
            await $`bun pub`; 
            console.log("Publish successful!");

        } catch (e) {
            console.error("Publish failed! Reverting version change.");
            
            await commands["version:decrease"]();
            
            process.exit(1); 
        }
    }
} as const;


async function main(){
    
    const command = argv[2]; 

    const handler = commands[command];
    if (handler) {        
        await handler();
         process.exit(0);

    }
    console.log("unknown command %s",command);
    
    process.exit(1);

}
main();
