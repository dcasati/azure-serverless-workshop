import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure";
import * as website from "./website";
import * as functionApp from "./functionApp";
import * as mime from "mime";
import * as nodedir from "node-dir";
import * as fs from "fs";

const folderName = "droneapp-noauth";
const files = nodedir.files(folderName, { sync: true });
for (const file of files) {
    const name = file.substring(folderName.length+1);
    const contentType = mime.getType(file) || undefined;

    const rawText = fs.readFileSync(file, "utf8").toString();
    const asset = functionApp.functionUrl
        .apply(url => rawText.replace("[API_URL]", url))
        .apply(text => new pulumi.asset.StringAsset(text));

    const myObject = new azure.storage.Blob(name, {
        name,
        storageAccountName: website.storageAccount.name,
        storageContainerName: "$web",
        type: "Block",
        source: asset,
        contentType,
    }, { parent: website.storageAccount });
}
