<template>
  <div @mousedown="onMouseDown" :class="{ 'sidebar-open': visibleSlide }">
    <transition v-if="pdfDocument && !touchEnable" name="slide">
      <preview v-show="visibleSlide" :pdf-document="pdfDocument" :is-preview-enabled="visibleSlide" :current-page="currentPage" @page-focus="handlePageFocus"/>
    </transition>
    <div ref="containerNode" class="pdf-highlighter" @contextmenu.prevent >
      <div class="pdfViewer" />
      <mouse-selection
          v-if="!readOnly && typeof enableAreaSelection === 'function'"
          @dragstart="() => toggleTextSelection(true)"
          @dragend="() => toggleTextSelection(false)"
          @change="isVisible => isAreaSelectionInProgress = isVisible"
          :should-start="shouldStart"
          @selection="handleSelection"
      />
    </div>
    <div class="hint" :style="{ opacity: hintOpacity }">
      <div class="hint-container">{{ i18n.t('hint-message') }}</div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import device from 'current-device'
import Hammer from 'hammerjs'
import pdfjs, { PDFLinkService, PDFViewer, EventBus } from '../lib/pdfjs'

import i18n from '../lib/i18n'
import getBoundingRect from '../lib/get-bounding-rect'
import getClientRects from '../lib/get-client-rects'
import getAreaAsPng from '../lib/get-area-as-png'

import {
  getPageFromRange,
  getPageFromElement,
  findOrCreateContainerLayer
} from '../lib/pdfjs-dom'

import { scaledToViewport, viewportToScaled } from '../lib/coordinates'
import MouseSelection from './MouseSelection'
import TipContainer from './TipContainer'
import Popup from './Popup'
import Tip from './Tip'
import Preview from './Preview'

const EMPTY_ID = 'empty-id'
export default {
  name: 'PdfHighlighter',
  // eslint-disable-next-line vue/no-unused-components
  components: { Preview, MouseSelection, Popup, Tip, TipContainer },
  props: {
    url: String,
    password: String,
    // 如何启用框选批注
    enableAreaSelection: Function,
    highlights: Array,
    // 是否激活
    isActive: {
      type: Boolean,
      default: true
    },
    // 允许更新高亮
    editable: {
      type: Boolean,
      default: true
    },
    // 只读模式: 只初始化pdf预览，
    readOnly: Boolean,
    // 渲染方式: canvas 或 svg。已知svg的bug: demo3 首页不显示; demo4 ios微信加载时下滑会刷新
    renderer: {
      type: String,
      default: 'canvas'
    },
    lang: Object,
    cMapUrl: String,
    scrollMargin: Number
  },
  data () {
    return {
      i18n: i18n,
      pdfDocument: null,
      viewer: null,
      touchEnable: device.tablet() || device.mobile(),
      linkService: new PDFLinkService(),
      debouncedAfterSelection: null,
      ghostHighlight: null,
      isCollapsed: true,
      range: null,
      scrolledToHighlightId: EMPTY_ID,
      isAreaSelectionInProgress: false,
      isPresentationMode: false,
      tip: null,
      hintOpacity: 0,
      visibleSlide: false,
      currentPage: 1,
      eventBus: new EventBus()
    }
  },
  watch: {
    highlights: function () {
      this.renderHighlights()
    },
    isActive: function (val, oldVal) {
      if (!oldVal && val) {
        this.hintOpacity = 0.9
        setTimeout(() => {
          this.hintOpacity = 0
        }, 2500)
      }
      if (!val) {
        this.$refs.selection && this.$refs.selection.reset()
        this.hideTipAndSelection()
      }
    }
  },
  methods: {
    handlePageFocus (pageNumber) {
      this.viewer.container.removeEventListener('scroll', this.onScroll)
      this.currentPage = pageNumber
      this.viewer.scrollPageIntoView({ pageNumber })
      setTimeout(() => {
        this.viewer.container.addEventListener('scroll', this.onScroll)
      }, 100)
    },
    handleCommand (command, other = 1.1) {
      let newScale
      switch (command) {
        case 'toggleSlide':
          this.visibleSlide = !this.visibleSlide
          break
        case 'zoomOut':
          newScale = this.viewer.currentScale
          newScale = (newScale / other).toFixed(2)
          newScale = Math.floor(newScale * 10) / 10
          newScale = Math.max(0.1, newScale)
          this.viewer.currentScaleValue = newScale
          break
        case 'zoomIn':
          newScale = this.viewer.currentScale
          newScale = (newScale * other).toFixed(2)
          newScale = Math.ceil(newScale * 10) / 10
          newScale = Math.min(10.0, newScale)
          this.viewer.currentScaleValue = newScale
          break
        case 'presentationMode':
          if (this.isPresentatingMode) {
            document.exitFullscreen()
            this.isPresentatingMode = false
          } else if ('requestFullscreen' in this.$el) {
            this.$el.requestFullscreen()
            this.isPresentatingMode = true
          }
          break
      }
    },

    shouldStart (event) {
      return this.isActive && this.enableAreaSelection(event) && event.target instanceof HTMLElement && Boolean(event.target.closest('.page'))
    },

    handleSelection (startTarget, boundingRect, resetSelection) {
      const page = getPageFromElement(startTarget)

      if (!page) {
        return
      }

      const pageBoundingRect = {
        ...boundingRect,
        top: boundingRect.top - page.node.offsetTop,
        left: boundingRect.left - page.node.offsetLeft
      }

      const viewportPosition = {
        boundingRect: pageBoundingRect,
        rects: [],
        pageNumber: page.number
      }

      const scaledPosition = this.viewportPositionToScaled(
        viewportPosition
      )

      const image = this.screenshot(pageBoundingRect, page.number)

      this.renderTipAtPosition(
        viewportPosition,
        this.onSelectionFinished(
          scaledPosition,
          { image },
          () => this.hideTipAndSelection(),
          () => {
            this.ghostHighlight = {
              isGhost: true,
              position: scaledPosition,
              content: { image }
            }
            resetSelection()
            this.renderHighlights()
          }
        )
      )
    },

    findOrCreateHighlightLayer (page) {
      const textLayer = this.viewer.getPageView(page - 1).textLayer

      if (!textLayer) {
        return null
      }

      return findOrCreateContainerLayer(
        textLayer.textLayerDiv,
        'pdf-highlighter__highlight-layer'
      )
    },

    groupHighlightsByPage (highlights) {
      const { ghostHighlight } = this

      return [...highlights, ghostHighlight]
        .filter(Boolean)
        .reduce((res, highlight) => {
          const { pageNumber } = highlight.position

          res[pageNumber] = res[pageNumber] || []
          res[pageNumber].push(highlight)

          return res
        }, {})
    },

    showTip (highlight, content) {
      const {
        isCollapsed,
        ghostHighlight,
        isAreaSelectionInProgress
      } = this

      const highlightInProgress = !isCollapsed || ghostHighlight

      if (highlightInProgress || isAreaSelectionInProgress) {
        return
      }

      this.renderTipAtPosition(highlight.position, content)
    },

    scaledPositionToViewport ({ pageNumber, boundingRect, rects, usePdfCoordinates }) {
      const viewport = this.viewer.getPageView(pageNumber - 1).viewport

      return {
        boundingRect: scaledToViewport(boundingRect, viewport, usePdfCoordinates),
        rects: (rects || []).map(rect =>
          scaledToViewport(rect, viewport, usePdfCoordinates)
        ),
        pageNumber
      }
    },

    viewportPositionToScaled ({ pageNumber, boundingRect, rects }) {
      const viewport = this.viewer.getPageView(pageNumber - 1).viewport

      return {
        boundingRect: viewportToScaled(boundingRect, viewport),
        rects: (rects || []).map(rect => viewportToScaled(rect, viewport)),
        pageNumber
      }
    },

    screenshot (position, pageNumber) {
      const canvas = this.viewer.getPageView(pageNumber - 1).canvas

      return getAreaAsPng(canvas, position)
    },

    hideTipAndSelection () {
      const tipNode = findOrCreateContainerLayer(this.viewer.viewer, 'pdf-highlighter__tip-layer')
      tipNode.$slots.default = []
      tipNode.$forceUpdate()

      this.ghostHighlight = null
      this.tip = null
      this.renderHighlights()
    },

    onTextLayerRendered () {
      this.renderHighlights()
    },

    // 提供ref函数
    scrollTo (highlight) {
      const { pageNumber, boundingRect, usePdfCoordinates } = highlight.position

      const pageViewport = this.viewer.getPageView(pageNumber - 1).viewport

      const scrollMargin = this.scrollMargin || Math.round(window.innerHeight / 4)

      this.viewer.scrollPageIntoView({
        pageNumber,
        destArray: [
          null,
          { name: 'XYZ' },
          ...pageViewport.convertToPdfPoint(
            0,
            scaledToViewport(boundingRect, pageViewport, usePdfCoordinates).top -
            scrollMargin
          ),
          0
        ]
      })

      this.selectHighlight(highlight)
    },

    selectHighlight (highlight) {
      this.viewer.container.removeEventListener('scroll', this.onScroll)
      this.scrolledToHighlightId = highlight.id
      this.renderHighlights()

      // wait for scrolling to finish
      setTimeout(() => {
        this.viewer.container.addEventListener('scroll', this.onScroll)
      }, 100)
    },

    onSelectionChange () {
      const selection = window.getSelection()

      if (selection.isCollapsed) {
        this.isCollapsed = true
        return
      }

      const range = selection.getRangeAt(0)

      if (!range) {
        return
      }

      this.isCollapsed = false
      this.range = range
      window.range = range

      this.debouncedAfterSelection()
    },

    onScroll () {
      this.$emit('scroll')
      this.scrolledToHighlightId = EMPTY_ID
      this.renderHighlights()
      this.viewer.container.removeEventListener('scroll', this.onScroll)
    },

    onMouseDown (event) {
      if (!(event.target instanceof HTMLElement)) {
        return
      }

      if (event.target.closest('.pdf-highlighter__tip-container')) {
        return
      }

      this.hideTipAndSelection()
    },

    handleKeyDown (event) {
      if (event.code === 'Escape') {
        this.hideTipAndSelection()
      }
    },

    afterSelection () {
      const { onSelectionFinished, isCollapsed, range, isActive } = this

      if (!isActive) {
        return
      }

      if (!range || isCollapsed) {
        return
      }

      const page = getPageFromRange(range)

      if (!page) {
        return
      }

      const rects = getClientRects(range, page.node)

      if (rects.length === 0) {
        return
      }

      const boundingRect = getBoundingRect(rects)

      const viewportPosition = { boundingRect, rects, pageNumber: page.number }

      const content = {
        text: range.toString()
      }
      const scaledPosition = this.viewportPositionToScaled(viewportPosition)

      this.renderTipAtPosition(
        viewportPosition,
        onSelectionFinished(
          scaledPosition,
          content,
          () => this.hideTipAndSelection(),
          () => {
            this.ghostHighlight = { isGhost: true, position: scaledPosition }
            this.renderHighlights()
          }
        )
      )
    },

    toggleTextSelection (flag) {
      this.viewer.viewer.classList.toggle(
        'pdf-highlighter--disable-selection',
        flag
      )
    },

    onSelectionFinished (position, content, hideTipAndSelection, transformSelection) {
      return this.$createElement('tip', {
        on: {
          open: transformSelection,
          cancel: () => hideTipAndSelection(),
          confirm: comment => {
            this.$emit('add-highlight', { content, position, comment })

            hideTipAndSelection()
          }
        }
      })
    },

    renderHighlights () {
      const { highlights, pdfDocument, tip, scrolledToHighlightId } = this
      if (!pdfDocument) return

      const highlightsByPage = this.groupHighlightsByPage(highlights)

      for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
        const highlightLayer = this.findOrCreateHighlightLayer(pageNumber)

        let children = []
        if (highlightLayer) {
          children = (highlightsByPage[String(pageNumber)] || []).map(
            (highlight, index) => {
              const { className, position, ...rest } = highlight

              const viewportHighlight = {
                position: this.scaledPositionToViewport(position),
                className,
                ...rest
              }

              if (tip && tip.highlight.id === String(highlight.id)) {
                this.showTip(tip.highlight, tip.callback(viewportHighlight))
              }

              const isScrolledTo = Boolean(scrolledToHighlightId === highlight.id)

              return this.$createElement('popup', {
                key: index,
                props: {
                  highlight: viewportHighlight,
                  isScrolledTo,
                  editable: this.editable
                },
                on: {
                  mouseOut: this.hideTipAndSelection,
                  mouseOver: popupContent => {
                    const callback = highlight => popupContent
                    this.tip = { highlight: viewportHighlight, callback }
                    this.showTip(viewportHighlight, callback(viewportHighlight))
                  },
                  change: boundingRect => {
                    this.$emit('update-highlight', viewportHighlight.id, { boundingRect: viewportToScaled(boundingRect, this.viewer.getPageView(pageNumber - 1).viewport) },
                      { image: this.screenshot(boundingRect, pageNumber) })
                  },
                  delete: () => this.$emit('remove-highlight', highlight),
                  select: () => {
                    this.selectHighlight(highlight)
                    this.$emit('select-highlight', highlight)
                  }
                }
              }, null)
            }
          )
          highlightLayer.$slots.default = [this.$createElement('div', children)]
          highlightLayer.$forceUpdate()
        }
      }
    },

    renderTipAtPosition (position, inner) {
      const { boundingRect, pageNumber } = position

      const page = {
        node: this.viewer.getPageView(pageNumber - 1).div
      }

      const pageBoundingRect = page.node.getBoundingClientRect()

      const tipNode = findOrCreateContainerLayer(this.viewer.viewer, 'pdf-highlighter__tip-layer')
      const instance = this.$createElement('tip-container', {
        props: {
          scrollTop: this.viewer.container.scrollTop,
          pageBoundingRect: pageBoundingRect,
          position: {
            left: page.node.offsetLeft + boundingRect.left + boundingRect.width / 2,
            top: boundingRect.top + page.node.offsetTop,
            bottom: boundingRect.top + page.node.offsetTop + boundingRect.height
          }
        }
      }, [inner])
      tipNode.$slots.default = [instance]
      tipNode.$forceUpdate()
    },
    loadPdf (password) {
      pdfjs
        .getDocument({
          url: this.url,
          eventBusDispatchToDOM: true,
          password: password || this.password,
          cMapUrl: this.cMapUrl,
          cMapPacked: !!this.cMapUrl
        })
        .promise.then(pdfDocument => {
          this.pdfDocument = pdfDocument
          this.viewer = new PDFViewer({
            container: this.$refs.containerNode,
            enhanceTextSelection: true,
            removePageBorders: true,
            textLayerMode: this.touchEnable ? 0 : 1,
            linkService: this.linkService,
            eventBus: this.eventBus,
            renderer: this.renderer
          })

          this.viewer.setDocument(pdfDocument)
          this.linkService.setDocument(pdfDocument)
          this.linkService.setViewer(this.viewer)
        }).catch(e => {
          console.log(e)
          this.$emit('error', e, password => this.loadPdf(password))
        })
    },
    initTouchDevice () {
      if (!this.touchEnable) {
        return
      }
      // 阻止双击放大
      let lastTouchEnd = 0
      document.addEventListener('touchstart', event => event.touches.length > 1 && event.preventDefault())
      document.addEventListener('touchend', event => {
        const now = (new Date()).getTime()
        if (now - lastTouchEnd <= 300) {
          event.preventDefault()
        }
        lastTouchEnd = now
      }, false)
      // 阻止双指放大
      document.addEventListener('gesturestart', event => event.preventDefault())

      const hammer = new Hammer(document, {
        enable: true
      })

      hammer.get('pinch').set({ enable: true })
      let begin
      hammer.on('pinchstart', ({ scale }) => (begin = scale))
      hammer.on('pinchout', ({ scale }) => {
        const newScale = this.viewer.currentScale + (scale - begin)
        this.viewer.currentScaleValue = Math.min(10.0, newScale)
        begin = scale
      })
      hammer.on('pinchin', ({ scale }) => {
        const newScale = this.viewer.currentScale - (begin - scale)
        this.viewer.currentScaleValue = Math.max(0.1, newScale)
        begin = scale
      })
    },
    initEvent (destory = false) {
      if (this.readOnly) {
        return
      }
      if (destory) {
        document.removeEventListener('selectionchange', this.onSelectionChange)
        document.removeEventListener('keydown', this.handleKeyDown)
        this.eventBus.off('textlayerrendered', this.onTextLayerRendered)
      } else {
        this.debouncedAfterSelection = _.debounce(this.afterSelection, 500)
        document.addEventListener('selectionchange', this.onSelectionChange)
        document.addEventListener('keydown', this.handleKeyDown)
        this.eventBus.on('textlayerrendered', this.onTextLayerRendered)
      }
    }
  },
  created () {
    this.i18n.set(this.lang)
  },
  mounted () {
    this.loadPdf()

    // debug
    window.PdfViewer = this

    this.eventBus.on('pagesinit', () => {
      this.viewer.currentScaleValue = 'auto'

      this.$emit('loaded', {
        viewer: this.viewer,
        page: {
          current: this.currentPage,
          total: this.pdfDocument.numPages
        }
      })
    })

    this.eventBus.on('pagechanging', (detail) => {
      this.currentPage = detail.pageNumber

      this.$emit('change', {
        viewer: this.viewer,
        page: {
          current: detail.pageNumber,
          total: this.pdfDocument.numPages
        }
      })
    })

    this.initEvent()
    this.initTouchDevice()
  },
  beforeDestroy () {
    this.initEvent(true)
  }
}
</script>

<style lang="scss" src="../assets/style.scss" />
<style scoped lang="scss">
.hint {
  transition-property: opacity;
  transition-duration: .5s;
  transition-delay: unset;
  white-space: nowrap;
  position: absolute;
  pointer-events: none;
  top: 80px;
  width: 100%;
  text-align: center;
  opacity: 0;

  .hint-container {
    width: 200px;
    margin: 0 auto;
    line-height: normal;
    font-size: 14px;
    color: #fff;
    background-color: #243247;
    padding: 5px 10px;
    border-radius: 5px;
  }
}
</style>
