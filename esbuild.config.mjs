import * as esbuild from "esbuild";
import { GasPlugin } from "esbuild-gas-plugin";

await esbuild.build({
	entryPoints: ["src/index.ts"],
	bundle: true,
	outfile: "dist/index.js",
	target: "es2019",
	format: "iife",
	platform: "browser",
	plugins: [GasPlugin],
});
