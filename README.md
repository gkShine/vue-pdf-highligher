## vue-pdf-highlighter

`vue-pdf-highlighter` is a [Vue2](https://v2.vuejs.org/) library that provides annotation experience for PDF documents on web. It is built on top of PDF.js by Mozilla. Text and rectangular highlights are supported. Highlight
data format is independent of the viewport, making it suitable for saving on the
server.

### Example

For online example check https://github.com/gkShine/vue-pdf-highligher/.

To run the example app locally:

```
npm install
npm start
```


### FAQ

##### Can I get a new PDF with the highlights embedded into the document?

Take a look at https://pdf-lib.js.org.

##### Wasn't this named react-pdf-annotator at some point?

Yes, but people from https://www.pdfannotator.com/ asked me to rename, since [they have a trademark for PDF Annotator](https://www.pdfannotator.com/en/help/infodisclaimer).

##### I'm trying the demo with my PDF and it is not loading!

Please check the [CORS headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) on your url. It is required for the cross-domain request.

### Compatibility

Works in Google Chrome, Safari 10+, Firefox 52+. Not tested in Internet
Explorer.
