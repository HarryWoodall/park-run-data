import fs from "fs";
import { getTimeStamp } from "../helpers/timeHelpers";

export default async function writeHtmlFile(href: string, name: string = "test.html") {
  console.log(`getting data about: ${name}`);
  console.log(`fetching: ${href}`);
  console.log(``);
  const res = await fetch(href, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    },
  });
  const html = await res.text();

  fs.writeFile(`${process.cwd()}/data/html/${name}`, html, function (err: any) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
}

export function deleteHtmlFile(name: string) {
  console.log(`removing ${name}`);
  fs.unlinkSync(`${process.cwd()}/data/html/${name}`);
}

export function writeToLogFile(message: string) {
  fs.appendFileSync(`${process.cwd()}/data/logs/logfile.txt`, `${getTimeStamp()} -- ${message}\n`);
}
