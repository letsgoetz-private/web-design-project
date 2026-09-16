import { copyFile, mkdir } from "node:fs/promises";
import { pageSlugs } from "../src/site/consts.ts";

const output = new URL("../dist/", import.meta.url);
for (const slug of Object.values(pageSlugs)) {
  const directory = new URL(`${slug}/`, output);
  await mkdir(directory, { recursive: true });
  await copyFile(new URL("index.html", output), new URL("index.html", directory));
}
