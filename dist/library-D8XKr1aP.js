// node_modules/@embedpdf/default-fallback-fonts/library.js
var e = [
	{
		key: "noto-sans-hebrew",
		familyName: "Noto Sans Hebrew",
		weight: 400,
		italic: !1,
		file: "NotoSansHebrew-Regular.ttf"
	},
	{
		key: "noto-sans-hebrew-bold",
		familyName: "Noto Sans Hebrew",
		weight: 700,
		italic: !1,
		file: "NotoSansHebrew-Bold.ttf"
	},
	{
		key: "noto-naskh-arabic",
		familyName: "Noto Naskh Arabic",
		weight: 400,
		italic: !1,
		file: "NotoNaskhArabic-Regular.ttf"
	},
	{
		key: "noto-naskh-arabic-bold",
		familyName: "Noto Naskh Arabic",
		weight: 700,
		italic: !1,
		file: "NotoNaskhArabic-Bold.ttf"
	}
], t = {
	"noto-sans-hebrew": () => import("./noto-sans-hebrew-BYzc3vFz.js"),
	"noto-sans-hebrew-bold": () => import("./noto-sans-hebrew-bold-EXCdS7lc.js"),
	"noto-naskh-arabic": () => import("./noto-naskh-arabic-C3BS833u.js"),
	"noto-naskh-arabic-bold": () => import("./noto-naskh-arabic-bold-BmwDS4MS.js")
};
async function n(e) {
	let n = t[e];
	if (!n) throw Error(`@embedpdf/default-fallback-fonts: no font "${e}"`);
	let { default: i } = await n();
	return r(i);
}
function r(e) {
	let t = atob(e), n = new Uint8Array(t.length);
	for (let e = 0; e < t.length; e++) n[e] = t.charCodeAt(e);
	return n;
}
export { e as DEFAULT_FALLBACK_FONTS, n as loadFallbackFont };
