import { LightningElement, api, track  } from 'lwc'
import u from 'c/lwcUtils'

export default class LwcCombobox extends LightningElement {
  @api label
  @api fieldLevelHelp
  @api disabled
  @api required
  @api messageWhenValueMissing = 'Complete this field'
  @api variant = 'standard'
  @api dropdownWidth
  @api multiple
  @api placeholder
  @api showSearchBox

  @track selectedItems = []

  get realPlaceholder () {
    return this.placeholder || (this.multiple ? 'Select one or more' : (this.required ? 'Select option' : 'None'))
  }

  @api
  get value () { return this._value }

  set value (v) {
    this._value = v
    this.calcSelectedItems()
    if (this.initialized) {
      this.checkValidity()
    }
  }

  @api
  get options () {
    return this._options
  }

  set options (v) {
    this._options = v || []
    if (this.initialized) {
      this.calcCOptions()
      this.calcSelectedItems()
    }
  }

  _options = []
  @track cOptions = []
  @track listFiltered = []

  calcSelectedItems () {
    const selValues = (this._value && this._value.split(';')) || []
    const optionsMap = u.keyBy(this.options || [], x => x.value)
    const selectedItems = selValues.map(x => optionsMap[x]).filter(x => x)
    const requiredAndOnly1Option = selectedItems.length === 0 && this.options.length === 1 && this.required
    if (requiredAndOnly1Option) {
      this.dispatchEvent(new CustomEvent('change', {
        detail: { value: this.options[0].value }
      }))
    } else {
      this.selectedItems = selectedItems
      const selValuesSet = new Set(selValues)
      this.cOptions.forEach(x => {
        if (x.options) x.options.forEach(y => (y.isSelected = selValuesSet.has(y.value)))
        else x.isSelected = selValuesSet.has(x.value)
      })
    }
  }

  get hasSections () {
    return (this.options || []).some(x => !!x.section && x.section !== 'Other')
  }

  calcCOptions () {
    const self = this
    const tmpOpt = (this.options || []).map((o, idx) => {
      return {
        ...o,
        onClick: (e) => {
          this.mustKeepOpen = true
          this.selectItem(o, idx)
        },
        isSelected: self.multiple ? (self.value || '').split(';').includes(o.value) : (self.value || '') === o.value
      }
    })

    if (this.hasSections) {
      const groupedOpt = u.groupBy(tmpOpt, v => v.section)
      const groupedOptArr = []
      Object.keys(groupedOpt).forEach(el => {
        if (el !== 'Other') groupedOptArr.push(groupedOpt[el])
      })
      if (groupedOpt.Other) groupedOptArr.push(groupedOpt.Other)
      this.cOptions = groupedOptArr.map(x => {
        return {
          section: x[0].section,
          options: x
        }
      })
    } else {
      this.cOptions = tmpOpt
      this.listFiltered = this.cOptions.slice()
    }
  }

  @track
  _comboOpen = false

  @api
  focusOnInput () { this.template.querySelector('input').focus() }

  get comboOpen () { return this._comboOpen }

  set comboOpen (v) {
    this._comboOpen = v
    if (this.initialized && v) {
      window.requestAnimationFrame(this.bindedCalc)
    }
  }

  @track showErrors = false
  @track hasErrors = false

  get displayValue () {
    const x = this.selectedItems
    return x.length === 1 ? x[0].label : (!x.length ? '' : `${x.length} items selected`)
  }

  toggleCombo (e) {
    if (e.type === 'keydown' && (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) && e.keyCode !== 9) return

    if (e.type === 'keydown') {
      e.stopPropagation()
    } else {
      this.mustKeepOpen = true
    }
    if (e.type === 'keydown') {
      if (e.keyCode && e.keyCode === 27) {
        if (this.comboOpen) {
          this.closeCombo()
        } else {
          const el = this.template.querySelector('input')
          el && el.blur()
        }
      } else if (e.keyCode && e.keyCode === 9) {
        this.closeCombo()
      } else if ([40, 38, 13].includes(e.keyCode)) {
        e.preventDefault()
        if (this.comboOpen) this.handleKeyPress(e.keyCode)
        else {
          this.comboOpen = true
          this.handleKeyPress(e.keyCode, true)
        }
      } else if (e.keyCode && e.keyCode !== 27) {
        if (!this.comboOpen) this.comboOpen = true
      }
    } else if (e.type === 'click') {
      if (this.comboOpen) {
        this.closeCombo()
      } else {
        this.comboOpen = true
      }
    }
  }

  searchResultPosition = 0
  keepPicklistOpen
  handleKeyPress (keyCode, setupPosition = false) {
    if (setupPosition) {
      this.searchResultPosition = 0
      if (keyCode === 40) {
        this.navigateOnSearchResults(0)
      } else if (keyCode === 38) {
        this.navigateOnSearchResults(this.listFiltered.length - 1)
      } else if (keyCode === 13) {
        this.keepPicklistOpen = true
        const idx = this.listFiltered.findIndex(x => x.value === this.value)
        this.navigateOnSearchResults(idx !== -1 ? idx : 0)
      }
    } else if (keyCode === 13) {
      this.selectItem(this.listFiltered[this.searchResultPosition], this.searchResultPosition)
    } else {
      this.navigateOnSearchResults(keyCode === 40 ? 1 : -1)
    }
  }

  navigateOnSearchResults (position) {
    const resultPosition = (x) => {
      const pos = x + position
      if (pos < 0) return this.listFiltered.length - 1
      if (pos > this.listFiltered.length - 1) return 0
      return pos
    }
    this.searchResultPosition = resultPosition(this.searchResultPosition)
    this.unsetSelectedOptions()
    const el = this.template.querySelector(`li.slds-listbox__item:nth-child(${this.searchResultPosition + 1})`)
    if (el) el.classList.add('add-row-focus')
    const dropdownScrollable = this.template.querySelector('.slds-dropdown')
    const elCoords = el.getBoundingClientRect()
    const dropdownCoords = dropdownScrollable.getBoundingClientRect()
    const isOutsideUp = elCoords.top < dropdownCoords.top
    const isOutsideDown = elCoords.bottom > dropdownCoords.bottom
    if (isOutsideUp || isOutsideDown) {
      dropdownScrollable.scrollTop = (isOutsideDown ? 7 : 0) + (this.showSearchBox ? this.searchResultPosition + 2 : this.searchResultPosition + 1) * el.offsetHeight - dropdownScrollable.offsetHeight
    }
  }

  unsetSelectedOptions () {
    this.template.querySelectorAll('li.slds-listbox__item.add-row-focus').forEach(x => x.classList.remove('add-row-focus'))
  }

  closeCombo () {
    if (this.mustKeepOpen) {
      this.mustKeepOpen = false
      return
    }

    this.unsetSelectedOptions()
    this.comboOpen = false
    if (this.template.querySelector('[data-id="searchBox"]')) this.template.querySelector('[data-id="searchBox"]').value = ''
    this.listFiltered = this.cOptions.slice()
    this.noResult = false
    this.startMovingWithArrows = false
  }

  get comboClass () {
    return [
      'slds-combobox',
      'slds-dropdown-trigger',
      'slds-dropdown-trigger_click',
      this.comboOpen ? 'slds-is-open' : ''
    ].join(' ')
  }

  get formElementClasses () {
    return [
      this.variant === 'label-inline' ? 'slds-form-element_horizontal' : 'slds-form-element',
      this.displayError || this.displayCustomError ? 'slds-has-error' : ''
    ].join(' ')
  }

  calcDropdownPosition () {
    if (!this.comboOpen) return
    window.requestAnimationFrame(this.bindedCalc)

    const cmpEl = this.template.querySelector('.slds-combobox__form-element')
    const fixedEl = this.template.querySelector('.slds-dropdown')
    if (!cmpEl || !fixedEl) return
    const inputElCoords = cmpEl.getBoundingClientRect()
    const fixedRect = fixedEl.getBoundingClientRect()
    const deltaX = Math.round(fixedRect.left) - Math.round(fixedEl.offsetLeft)
    const deltaY = Math.round(fixedRect.top) - Math.round(fixedEl.offsetTop)

    let dropTop = inputElCoords.bottom - deltaY
    let dropLeft = inputElCoords.left - deltaX
    const dropHeight = fixedRect.bottom - fixedRect.top
    const inputElHeight = inputElCoords.bottom - inputElCoords.top

    if (dropTop + dropHeight >= window.innerHeight) dropTop -= (dropHeight + inputElHeight + 4)
    if (this.dropdownWidth && dropLeft + parseInt(this.dropdownWidth, 10) >= window.innerWidth) {
      dropLeft -= (parseInt(this.dropdownWidth, 10) - (inputElCoords.right - inputElCoords.left))
    }

    if (
      this.lastCoords &&
      this.lastCoords.left === Math.round(inputElCoords.left) &&
      this.lastCoords.bottom === Math.round(inputElCoords.bottom) &&
      this.lastCoords.right === Math.round(inputElCoords.right) &&
      this.lastCoords.dropTop === Math.round(dropTop) &&
      Math.abs(this.lastCoords.deltaX - deltaX) < 10 &&
      Math.abs(this.lastCoords.deltaY - deltaY) < 10
    ) {
      if (this.template.querySelector('[data-id="searchBox"]')) this.template.querySelector('[data-id="searchBox"]').focus()
      return
    }

    this.lastCoords = {
      left: Math.round(inputElCoords.left),
      right: Math.round(inputElCoords.right),
      bottom: Math.round(inputElCoords.bottom),
      dropTop: Math.round(dropTop),
      deltaX,
      deltaY
    }

    fixedEl.style.top = dropTop + 'px'
    fixedEl.style.left = dropLeft + 'px'
    fixedEl.style.width = (this.dropdownWidth || (inputElCoords.right - inputElCoords.left)) + 'px'
    if (this.showSearchBox) fixedEl.style.paddingTop = 0

    if (this.template.querySelector('[data-id="searchBox"]')) this.template.querySelector('[data-id="searchBox"]').focus()
  }

  connectedCallback () {
    console.log('combobox called!!')
    this.bindedCalc = this.calcDropdownPosition.bind(this)
    this.bindedCloseCombo = () => (this.closeCombo())
    window.addEventListener('click', this.bindedCloseCombo)
    this.calcCOptions()
    this.calcSelectedItems()
    this.initialized = true
    this.listFiltered = this.cOptions.slice()
    this.searchResultPosition = this.cOptions.findIndex(x => x.value === this.value)
  }

  disconnectedCallback () {
    window.removeEventListener('click', this.bindedCloseCombo)
  }

  selectItem (o, idx) {
    let newVal
    if (this.multiple) {
      let selValues = (this.value && this.value.split(';')) || []
      if (selValues.includes(o.value)) {
        selValues = selValues.filter(x => x !== o.value)
      } else {
        selValues.push(o.value)
      }
      newVal = selValues.join(';')
    } else {
      this.searchResultPosition = idx
      newVal = o.value
    }
    this.dispatchEvent(new CustomEvent('change', {
      detail: {
        value: newVal
      }
    }))
    this.closeCombo()
    this.focus()
  }

  @api
  checkValidity () {
    this.hasErrors = this.required && !this.value
    return !this.hasErrors && !this.customMessage
  }

  @api
  reportValidity () {
    this.showErrors = this.hasErrors
  }

  get displayError () {
    return this.showErrors && this.hasErrors && !this.disabled
  }

  get reallyDisabled () {
    return this.disabled || !this.options || !this.options.length
  }

  removeSelectedItem (e) {
    const index = e.target.value
    const oldValueArr = this.value.split(';')
    oldValueArr.splice(index, 1)
    this.dispatchEvent(new CustomEvent('change', {
      detail: {
        value: oldValueArr.join(';')
      }
    }))
  }

  @track displayCustomError = false
  @track customMessage = ''

  @api
  setCustomValidity (v) {
    this.displayCustomError = !!v
    this.customMessage = v
  }

  @api
  focus () {
    if (!this.disabled) {
      const el = this.template.querySelector('input')
      el && el.focus()
    }
  }

  @track noResult = false

  mustKeepOpen = false
  startMovingWithArrows = false

  searchInList (event) {
    if (event.keyCode === 13 && !this.keepPicklistOpen) {
      if (!!event.target.value && !this.startMovingWithArrows) {
        const idx = this.cOptions.findIndex(x => x.value === this.listFiltered[0].value)
        this.selectItem(this.listFiltered[0], idx)
        return
      }
      const idx = this.cOptions.findIndex(x => x.value === this.listFiltered[this.searchResultPosition].value)
      this.selectItem(this.listFiltered[this.searchResultPosition], idx)
    } else if ([40, 38].includes(event.keyCode) && !this.keepPicklistOpen) {
      this.preventUpDownText(event)
      this.startMovingWithArrows = true
      this.handleKeyPress(event.keyCode)
    } else if ([9, 27].includes(event.keyCode)) {
      this.closeCombo()
      this.focus()
      return
    } else {
      this.startMovingWithArrows = false
    }

    this.keepPicklistOpen = false

    const searchWord = event.target.value
    this.listFiltered = this.cOptions.filter(e => e.label.toLowerCase().includes(searchWord.toLowerCase()))
    this.noResult = (this.listFiltered.length === 0)
  }

  keepOpen () {
    this.mustKeepOpen = true
  }

  preventUpDownText (event) {
    if ((event.type === 'keydown' || event.type === 'keyup') && [40, 38].includes(event.keyCode)) event.preventDefault()
  }
}