// node_modules/@embedpdf/engine-core/dist/fontFaces-yzPgDoNN.js
var e = {
	Unknown: "Unknown",
	InvalidArg: "InvalidArg",
	DocNotOpen: "DocNotOpen",
	DocOpenFailed: "DocOpenFailed",
	DocPasswordRequired: "DocPasswordRequired",
	DocPasswordIncorrect: "DocPasswordIncorrect",
	GrantPassphraseRequired: "GrantPassphraseRequired",
	Aborted: "Aborted",
	Network: "Network",
	Unauthenticated: "Unauthenticated",
	Forbidden: "Forbidden",
	NotFound: "NotFound",
	WireFormat: "WireFormat",
	RuntimeUnavailable: "RuntimeUnavailable",
	LayerVersionConflict: "LayerVersionConflict",
	NotImplemented: "NotImplemented",
	MalformedPdf: "MalformedPdf",
	SigningPending: "SigningPending",
	SigningExpired: "SigningExpired",
	SigningVersionMismatch: "SigningVersionMismatch",
	SignatureRefused: "SignatureRefused",
	ProtectedDocument: "ProtectedDocument",
	PayloadTooLarge: "PayloadTooLarge",
	ObjectNumberUnavailable: "ObjectNumberUnavailable",
	LayerFull: "LayerFull",
	ChangeConflict: "ChangeConflict",
	UndoUnavailable: "UndoUnavailable",
	IdempotencyKeyReused: "IdempotencyKeyReused",
	LayerDeleted: "LayerDeleted",
	VisitorIdentityRequired: "VisitorIdentityRequired",
	Conflict: "Conflict",
	EngineBusy: "EngineBusy",
	EngineRestarting: "EngineRestarting",
	DocumentQuarantined: "DocumentQuarantined",
	ThumbnailNotReady: "ThumbnailNotReady",
	TooManyRequests: "TooManyRequests",
	GrantExpired: "GrantExpired",
	OriginRequired: "OriginRequired",
	OriginNotAllowed: "OriginNotAllowed",
	FeatureNotEnabled: "FeatureNotEnabled",
	FeatureStopped: "FeatureStopped",
	LicenseInvalid: "LicenseInvalid",
	LicenseUsageLimit: "LicenseUsageLimit",
	UpstreamError: "UpstreamError"
};
new Set(Object.values(e));
function t(e) {
	"@babel/helpers - typeof";
	return t = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, t(e);
}
function n(e, n) {
	if (t(e) != "object" || !e) return e;
	var r = e[Symbol.toPrimitive];
	if (r !== void 0) {
		var i = r.call(e, n || "default");
		if (t(i) != "object") return i;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (n === "string" ? String : Number)(e);
}
function r(e) {
	var r = n(e, "string");
	return t(r) == "symbol" ? r : r + "";
}
function i(e, t, n) {
	return (t = r(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
var a = class e extends Error {
	constructor(e, t, n = {}) {
		super(t ?? e, n.cause === void 0 ? void 0 : { cause: n.cause }), i(this, "name", "EngineError"), i(this, "code", void 0), i(this, "details", void 0), this.code = e, this.details = n.details;
	}
	static is(t, n) {
		return !(t instanceof e) && t?.name !== "EngineError" ? !1 : n === void 0 || t.code === n;
	}
	toJSON() {
		return {
			code: this.code,
			message: this.message,
			details: this.details
		};
	}
};
function o(t) {
	return a.is(t) ? t.toJSON() : t instanceof Error ? {
		code: t.name === "AbortError" ? e.Aborted : e.Unknown,
		message: t.message
	} : {
		code: e.Unknown,
		message: String(t ?? "unknown error")
	};
}
function s(e) {
	return new a(e.code, e.message, { details: e.details });
}
function c(e) {
	return typeof e == "number" && Number.isInteger(e) && e > 0;
}
function l(e) {
	return {
		kind: "objectNumber",
		objectNumber: e
	};
}
function u(e, t) {
	return e.kind === t.kind && e.objectNumber === t.objectNumber;
}
function d(e) {
	if (!c(e.objectNumber)) throw RangeError(`encodePageKey: objectNumber must be a positive integer, got ${e.objectNumber}`);
	return `obj:${e.objectNumber}`;
}
function f(e) {
	switch (e.kind) {
		case "objectNumber": return `obj:${e.objectNumber}`;
		case "baseIndex": return `base:${e.page.objectNumber}:${e.baseIndex}`;
	}
}
var p = [
	"courier",
	"courier-bold",
	"courier-bold-oblique",
	"courier-oblique",
	"helvetica",
	"helvetica-bold",
	"helvetica-bold-oblique",
	"helvetica-oblique",
	"times-roman",
	"times-bold",
	"times-bold-italic",
	"times-italic",
	"symbol",
	"zapf-dingbats"
], m = {
	courier: {
		family: "Courier",
		weight: 400,
		italic: !1
	},
	"courier-bold": {
		family: "Courier",
		weight: 700,
		italic: !1
	},
	"courier-bold-oblique": {
		family: "Courier",
		weight: 700,
		italic: !0
	},
	"courier-oblique": {
		family: "Courier",
		weight: 400,
		italic: !0
	},
	helvetica: {
		family: "Helvetica",
		weight: 400,
		italic: !1
	},
	"helvetica-bold": {
		family: "Helvetica",
		weight: 700,
		italic: !1
	},
	"helvetica-bold-oblique": {
		family: "Helvetica",
		weight: 700,
		italic: !0
	},
	"helvetica-oblique": {
		family: "Helvetica",
		weight: 400,
		italic: !0
	},
	"times-roman": {
		family: "Times",
		weight: 400,
		italic: !1
	},
	"times-bold": {
		family: "Times",
		weight: 700,
		italic: !1
	},
	"times-bold-italic": {
		family: "Times",
		weight: 700,
		italic: !0
	},
	"times-italic": {
		family: "Times",
		weight: 400,
		italic: !0
	},
	symbol: {
		family: "Symbol",
		weight: 400,
		italic: !1
	},
	"zapf-dingbats": {
		family: "ZapfDingbats",
		weight: 400,
		italic: !1
	}
}, h = (e) => p.includes(e);
function g(e) {
	return e.toLowerCase().replace(/[\s\-_'"]/g, "");
}
var _ = {
	helvetica: "Helvetica",
	arial: "Helvetica",
	arialmt: "Helvetica",
	sansserif: "Helvetica",
	times: "Times",
	timesroman: "Times",
	timesnewroman: "Times",
	timesnewromanpsmt: "Times",
	serif: "Times",
	courier: "Courier",
	couriernew: "Courier",
	couriernewpsmt: "Courier",
	monospace: "Courier",
	symbol: "Symbol",
	zapfdingbats: "ZapfDingbats",
	dingbats: "ZapfDingbats"
};
function v(e) {
	return _[g(e)];
}
function y(e, t) {
	let n = t?.(e.family, e.weight, e.italic);
	if (n !== void 0) return n;
	let r = _[g(e.family)];
	if (r) {
		let t = Object.entries(m), n = e.weight >= 600, i = t.find(([, t]) => t.family === r && t.weight >= 600 === n && t.italic === e.italic) ?? t.find(([, e]) => e.family === r);
		if (i) return i[0];
	}
	return e.family;
}
function b(e) {
	let t = y({
		family: v(e.family) ?? "Helvetica",
		weight: e.weight ?? 400,
		italic: e.italic ?? !1
	});
	return h(t) ? t : "helvetica";
}
export { i as a, d as c, u as d, o as f, l as h, p as i, y as l, b as m, e as n, f as o, v as p, m as r, s, a as t, h as u };
