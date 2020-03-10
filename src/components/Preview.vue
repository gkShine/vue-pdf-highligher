<template>
  <scrolling-document
    class="pdf-preview"
    @pages-fetch="onPagesFetch"
    v-bind="{pages, pageCount, currentPage}"
    v-slot="{page, isPageFocused}"
    :is-parent-visible="isPreviewEnabled"
    >
    <thumbnail
      v-bind="{scale, page, isPageFocused}"
      @thumbnail-rendered="onThumbnailRendered"
      @thumbnail-errored="onThumbnailErrored"
      @page-focus="onPageFocused"
      />
  </scrolling-document>
</template>

<script>
import range from 'lodash/range'
import ScrollingDocument from './ScrollingDocument'
import Thumbnail from './Thumbnail'

export default {
  name: 'Preview',

  components: {
    Thumbnail,
    ScrollingDocument
  },

  props: {
    pdfDocument: Object,
    scale: {
      type: Number,
      default: 1.0
    },
    currentPage: {
      type: Number,
      default: 1
    },
    isPreviewEnabled: {
      default: false
    }
  },

  data () {
    return {
      pages: [],
      pageCount: this.pdfDocument.numPages
    }
  },

  methods: {
    onPagesFetch (currentPage) {
      this.$emit('pages-fetch', currentPage)
    },

    onPageFocused (pageNumber) {
      this.$emit('page-focus', pageNumber)
    },

    onThumbnailRendered (payload) {
      this.$el.dispatchEvent(new Event('scroll'))
      this.$parent.$emit('thumbnail-rendered', payload)
    },

    onThumbnailErrored (payload) {
      this.$emit('thumbnail-errored', payload)
    }
  },

  mounted () {
    const { pdfDocument, pageCount } = this
    Promise.all(range(1, pageCount + 1).map(number => pdfDocument.getPage(number))).then(pages => {
      this.pages = pages
    })
  }
}
</script>

<style scoped>
.pdf-preview {
  position: absolute;
  overflow: auto;
  z-index: 1;
  padding: 20px 0;
  top: 32px;
  left: 0;
  bottom: 0;
  width: 200px;
  background-color: hsla(0,0%,0%,.1);
  box-shadow: inset -1px 0 0 hsla(0,0%,0%,.25);
}

.scrolling-page {
  margin-bottom: 1em;
}

@media print {
  .pdf-preview {
    display: none;
  }
}
</style>
